/*
 * Создать или обновить один серверный объект ИПР и положить его в категорию.
 * Выполняется через ssjs-консоль (deploy-local.js подставляет сюда base64
 * от JSON вида { category: { code, name }, item: { kind, code, ... } }).
 *
 * Категория в WebSoft — объект role, свой на каждый тип объектов
 * (catalog_name), поэтому она создаётся отдельно под каждый kind.
 */

function mf_str( oSrc, sName, sDefault )
{
	return String( oSrc.GetOptProperty( sName, sDefault ) );
}

function find_id( sCatalog, sCode )
{
	var aFound = XQuery( "for $e in " + sCatalog + " where $e/code = " +
		XQueryLiteral( sCode ) + " return $e/Fields( \"id\" )" );
	var oFound = ArrayOptFirstElem( aFound );
	if ( oFound == undefined )
		return undefined;
	return oFound.id.Value;
}

function obtain_role( oCat, sKind )
{
	var sRoleCode = mf_str( oCat, 'code', '' );
	var aRoles = XQuery( "for $e in roles where $e/code = " +
		XQueryLiteral( sRoleCode ) + " and $e/catalog_name = " +
		XQueryLiteral( sKind ) + " return $e/Fields( \"id\" )" );
	var oRole = ArrayOptFirstElem( aRoles );
	var oRoleDoc;
	if ( oRole != undefined )
		return oRole.id.Value;

	oRoleDoc = OpenNewDoc( 'x-local://qti/qti_role.xmd' );
	oRoleDoc.BindToDb( DefaultDb );
	oRoleDoc.TopElem.code.Value = sRoleCode;
	oRoleDoc.TopElem.name.Value = mf_str( oCat, 'name', sRoleCode );
	oRoleDoc.TopElem.catalog_name.Value = sKind;
	oRoleDoc.Save();
	log( 'создана категория ' + sRoleCode + ' для ' + sKind );
	return oRoleDoc.DocID;
}

function fill_wvars( oTopElem, aVars )
{
	var j, oVar, oW, sValue, oRef, xRefId;
	oTopElem.wvars.Clear();
	for ( j = 0; j < aVars.length; j++ )
	{
		oVar = aVars[ j ];
		sValue = mf_str( oVar, 'value', '' );
		oRef = oVar.GetOptProperty( 'value_ref', undefined );
		if ( oRef != undefined )
		{
			xRefId = find_id( mf_str( oRef, 'catalog', '' ), mf_str( oRef, 'code', '' ) );
			if ( xRefId == undefined )
				throw 'не найден объект для переменной ' + mf_str( oVar, 'name', '' );
			sValue = String( xRefId );
		}
		oW = oTopElem.wvars.AddChild();
		oW.name.Value = mf_str( oVar, 'name', '' );
		oW.type.Value = mf_str( oVar, 'type', 'string' );
		if ( mf_str( oVar, 'catalog', '' ) != '' )
			oW.catalog.Value = mf_str( oVar, 'catalog', '' );
		oW.title.Value = mf_str( oVar, 'title', '' );
		oW.description.Value = mf_str( oVar, 'description', '' );
		oW.value.Value = sValue;
		oW.required.Value = oVar.GetOptProperty( 'required', false );
		oW.position.Value = j + 1;
	}
}

var oPayload = ParseJson( Base64Decode( '@@PAYLOAD_B64@@' ) );
var oItem = oPayload.item;
var sKind = mf_str( oItem, 'kind', '' );
var sCode = mf_str( oItem, 'code', '' );
var sBody = mf_str( oItem, 'body', '' );
var sUrl = mf_str( oItem, 'url', '' );
var sPresetId = mf_str( oItem, 'id', '' );
var aWvars = oItem.GetOptProperty( 'wvars', [] );
var oForms = {
	custom_web_template: 'x-local://wtv/wtv_custom_web_template.xmd',
	override_web_template: 'x-local://wtv/wtv_override_web_template.xmd',
	remote_collection: 'x-local://wtv/wtv_remote_collection.xmd',
	remote_action: 'x-local://wtv/wtv_remote_action.xmd',
	server_agent: 'x-local://wtv/wtv_server_agent.xmd',
	print_form: 'x-local://wtv/wtv_print_form.xmd'
};
var sForm = oForms.GetOptProperty( sKind, '' );
var xId, oDoc, oTe, iRoleId, iPresetId, oBusy, xTemplateId, oTemplate;
var bCreated = false;

if ( sForm == '' )
	throw 'неизвестный kind: ' + sKind;
if ( sCode == '' )
	throw 'в манифесте не задан code';

iRoleId = obtain_role( oPayload.category, sKind );
xId = find_id( sKind + 's', sCode );

if ( xId != undefined )
{
	oDoc = tools.open_doc( xId );
}
else
{
	oDoc = OpenNewDoc( sForm );
	bCreated = true;
	if ( sPresetId != '' )
	{
		/* документ с заранее известным id — как делает коробка при импорте */
		iPresetId = OptInt( sPresetId );
		oBusy = tools.open_doc( iPresetId );
		if ( oBusy != undefined )
			throw 'id ' + sPresetId + ' уже занят объектом ' + oBusy.TopElem.Name;
		oDoc.TopElem.id.Value = iPresetId;
		oDoc.Url = UrlFromDocID( iPresetId );
	}
	else
	{
		oDoc.BindToDb( DefaultDb );
	}
}

oTe = oDoc.TopElem;
oTe.code.Value = sCode;

switch ( sKind )
{
	case 'custom_web_template':
		oTe.name.Value = mf_str( oItem, 'name', sCode );
		oTe.comment.Value = mf_str( oItem, 'comment', '' );
		/* либо файл из web-root (собранный клиент), либо код в карточке */
		oTe.url.Value = sUrl;
		oTe.exec_code.code_url.Value = sUrl;
		oTe.exec_code.code_text.Value = ( sUrl == '' ? sBody : '' );
		oTe.html.Value = ( sUrl == '' ? sBody : '' );
		fill_wvars( oTe, aWvars );
		break;

	case 'override_web_template':
		xTemplateId = find_id( 'custom_web_templates', mf_str( oItem, 'template', '' ) );
		if ( xTemplateId == undefined )
			throw 'не найден шаблон ' + mf_str( oItem, 'template', '' );
		oTemplate = tools.open_doc( xTemplateId ).TopElem;
		oTe.mode.Value = mf_str( oItem, 'mode', sCode );
		oTe.zone.Value = mf_str( oItem, 'zone', 'main' );
		oTe.custom_web_template_id.Value = xTemplateId;
		oTe.custom_web_template_name.Value = oTemplate.name.Value;
		oTe.is_enabled.Value = true;
		oTe.comment.Value = mf_str( oItem, 'comment', '' );
		fill_wvars( oTe, aWvars );
		break;

	case 'remote_collection':
		oTe.name.Value = mf_str( oItem, 'name', sCode );
		oTe.catalog_name.Value = mf_str( oItem, 'catalog_name', '' );
		oTe.api_ver.Value = mf_str( oItem, 'api_ver', '1' );
		oTe.comment.Value = mf_str( oItem, 'comment', '' );
		oTe.exec_code.code_text.Value = sBody;
		oTe.exec_code.code_url.Value = '';
		oTe.url.Value = '';
		fill_wvars( oTe, aWvars );
		break;

	case 'remote_action':
		oTe.name.Value = mf_str( oItem, 'name', sCode );
		oTe.type.Value = mf_str( oItem, 'type', 'eval' );
		oTe.catalog_name.Value = mf_str( oItem, 'catalog_name', '' );
		oTe.comment.Value = mf_str( oItem, 'comment', '' );
		oTe.exec_code.code_text.Value = sBody;
		oTe.exec_code.code_url.Value = '';
		oTe.url.Value = '';
		fill_wvars( oTe, aWvars );
		break;

	case 'server_agent':
		oTe.name.Value = mf_str( oItem, 'name', sCode );
		oTe.type.Value = mf_str( oItem, 'type', 'code' );
		oTe.trigger_type.Value = mf_str( oItem, 'trigger_type', 'never' );
		oTe.comment.Value = mf_str( oItem, 'comment', '' );
		oTe.exec_code.code_text.Value = sBody;
		fill_wvars( oTe, aWvars );
		break;

	case 'print_form':
		/* шаблон формы хранится в карточке, в поле data */
		oTe.name.Value = mf_str( oItem, 'name', sCode );
		oTe.type.Value = mf_str( oItem, 'type', 'pdf' );
		oTe.file_encoding.Value = mf_str( oItem, 'file_encoding', 'utf-8' );
		oTe.file_name.Value = mf_str( oItem, 'file_name', sCode + '.html' );
		oTe.object_name.Value = mf_str( oItem, 'object_name', '' );
		oTe.data.Value = sBody;
		break;
}

oTe.role_id.ObtainByValue( iRoleId );
oDoc.Save();

/* перечитываем сохранённое */
oTe = tools.open_doc( oDoc.DocID ).TopElem;

RESULT = {
	kind: sKind,
	code: String( oTe.code.Value ),
	id: String( oDoc.DocID ),
	created: bCreated,
	name: String( oTe.name ),
	role_id: ArrayMerge( oTe.role_id, 'String( This.Value )', ',' ),
	wvars: ( sKind == 'print_form' ? '' : ArrayMerge( oTe.wvars, 'This.name.Value + "=" + This.value.Value', '; ' ) )
};
