/*
 * Тестовая структура СТЦ для локального стенда (на бой не запускать).
 * Создаёт «СТЦ Тестовый» с тремя дочерними подразделениями, шестерых
 * сотрудников с должностями и несколько ИПР в разных статусах, а пользователя
 * user1 (Иванов) переводит на должность «Управляющий» в администрации СТЦ.
 * Повторный запуск безопасен: объекты ищутся по коду ipr_test_*.
 *
 * Запуск: ws-eval.sh -f deploy/stand-stc-test-data.ssjs.js
 */

function find_by_code( sCatalog, sCode )
{
	var oFound = ArrayOptFirstElem( XQuery( "for $e in " + sCatalog +
		" where $e/code = " + XQueryLiteral( sCode ) + " return $e/Fields( \"id\" )" ) );
	if ( oFound == undefined )
		return undefined;
	return oFound.id.Value;
}

function obtain_doc( sCatalog, sForm, sCode )
{
	var xDocId = find_by_code( sCatalog, sCode );
	var oNew;
	if ( xDocId != undefined )
		return tools.open_doc( xDocId );
	oNew = OpenNewDoc( 'x-local://wtv/' + sForm );
	oNew.BindToDb( DefaultDb );
	oNew.TopElem.code.Value = sCode;
	log( 'создан ' + sCatalog + ' ' + sCode );
	return oNew;
}

function obtain_subdivision( sCode, sName, xParentId, xOrgId )
{
	var oSub = obtain_doc( 'subdivisions', 'wtv_subdivision.xmd', sCode );
	oSub.TopElem.name.Value = sName;
	oSub.TopElem.org_id.Value = xOrgId;
	if ( xParentId != undefined )
		oSub.TopElem.parent_object_id.Value = xParentId;
	oSub.Save();
	return oSub.DocID;
}

/* должность в подразделении и привязка к ней сотрудника как основной */
function set_position( xPersonId, sPosCode, sPosName, xSubId, sSubName, xOrgId, sOrgName, bIsBoss )
{
	var oPos = obtain_doc( 'positions', 'wtv_position.xmd', sPosCode );
	var oPerson;
	oPos.TopElem.name.Value = sPosName;
	oPos.TopElem.org_id.Value = xOrgId;
	oPos.TopElem.parent_object_id.Value = xSubId;
	oPos.TopElem.basic_collaborator_id.Value = xPersonId;
	oPos.TopElem.is_boss.Value = bIsBoss;
	oPos.Save();

	oPerson = tools.open_doc( xPersonId );
	oPerson.TopElem.position_id.Value = oPos.DocID;
	oPerson.TopElem.position_name.Value = sPosName;
	oPerson.TopElem.position_parent_id.Value = xSubId;
	oPerson.TopElem.position_parent_name.Value = sSubName;
	oPerson.TopElem.org_id.Value = xOrgId;
	oPerson.TopElem.org_name.Value = sOrgName;
	oPerson.Save();
}

function obtain_person( sCode, sLast, sFirst, sMiddle )
{
	var oPers = obtain_doc( 'collaborators', 'wtv_collaborator.xmd', sCode );
	oPers.TopElem.lastname.Value = sLast;
	oPers.TopElem.firstname.Value = sFirst;
	oPers.TopElem.middlename.Value = sMiddle;
	oPers.Save();
	return oPers.DocID;
}

/* ИПР сотрудника: создаётся один раз на пару «сотрудник + тип процесса + год» */
function obtain_ipr( xPersonId, xTutorId, sType, sStatus, sPlanDate, aComps, sCreateDate )
{
	var iYear = Year( sCreateDate == '' ? Date() : Date( sCreateDate ) );
	var aPlans = XQuery( "for $e in education_plans where $e/code = 'ipr' and $e/person_id = " +
		xPersonId + " return $e/Fields( \"id\", \"create_date\" )" );
	var oRow, oOld, oPlan, oTe, oFolder, oTask, k, nDone, nAll;
	for ( oRow in aPlans )
	{
		oOld = tools.open_doc( oRow.id ).TopElem;
		if ( String( oOld.custom_elems.ObtainChildByKey( 'ipr_type' ).value ) == sType &&
			Year( oRow.create_date ) == iYear )
			return oRow.id.Value;
	}

	oPlan = LIB.createEduPlan( xPersonId );
	oTe = oPlan.TopElem;
	oTe.tutor_id = xTutorId;
	oTe.plan_date = Date( sPlanDate );
	if ( sCreateDate != '' )
		oTe.create_date = Date( sCreateDate );
	oTe.custom_elems.ObtainChildByKey( 'ipr_type' ).value = sType;
	oTe.custom_elems.ObtainChildByKey( 'ipr_status' ).value = sStatus;

	nDone = 0;
	nAll = 0;
	for ( k = 0; k < aComps.length; k++ )
	{
		oFolder = oTe.programs.AddChild();
		oFolder.type = 'folder';
		oFolder.name = aComps[ k ];
		oFolder.comment = 'Цель по компетенции «' + aComps[ k ] + '»';
		oFolder.plan_date = oTe.plan_date;

		oTask = oTe.programs.AddChild();
		oTask.type = 'learning_task';
		oTask.name = 'Задача по компетенции «' + aComps[ k ] + '»';
		oTask.parent_progpam_id = oFolder.id.Value;
		oTask.plan_date = oTe.plan_date;
		nAll = nAll + 1;
		if ( sStatus == 'Завершено' || ( sStatus == 'В процессе' && k == 0 ) )
		{
			oTask.state_id = 4;
			oTask.finish_date = Date();
			nDone = nDone + 1;
		}
	}
	if ( sStatus == 'В процессе' || sStatus == 'Завершено' )
	{
		oTe.readiness_percent = ( nDone * 100 ) / nAll;
		oTe.custom_elems.ObtainChildByKey( 'ipr_approval_date' ).value = Date();
	}
	if ( sStatus == 'Завершено' )
	{
		oTe.state_id = 4;
		oTe.finish_date = Date();
	}
	oPlan.Save();
	log( 'создан ИПР: ' + oTe.person_fullname + ' / ' + sType + ' / ' + sStatus );
	return oPlan.DocID;
}

var LIB = OpenCodeLib( 'x-local://wt/web/custom_projects/ipr/ipr_lib.js' );

var oBossRow = ArrayOptFirstElem( XQuery( "for $e in collaborators where $e/login = 'user1' return $e" ) );
if ( oBossRow == undefined )
	throw 'на стенде нет пользователя user1';
var xBossId = oBossRow.id.Value;
var xOrgId = oBossRow.org_id.Value;
var sOrgName = String( oBossRow.org_name );
var sBossWas = String( oBossRow.position_name ) + ' / ' + String( oBossRow.position_parent_name ) +
	' (position_id=' + String( oBossRow.position_id ) + ')';

var xStc = obtain_subdivision( 'ipr_test_stc', 'СТЦ Тестовый', undefined, xOrgId );
var xAdm = obtain_subdivision( 'ipr_test_stc_adm', 'Администрация СТЦ Тестовый', xStc, xOrgId );
var xHall = obtain_subdivision( 'ipr_test_stc_hall', 'Торговый зал СТЦ Тестовый', xStc, xOrgId );
var xWh = obtain_subdivision( 'ipr_test_stc_wh', 'Складской комплекс СТЦ Тестовый', xStc, xOrgId );

var xRop = obtain_person( 'ipr_test_1', 'Соколов', 'Павел', 'Андреевич' );
var xSeller1 = obtain_person( 'ipr_test_2', 'Орлова', 'Марина', 'Сергеевна' );
var xSeller2 = obtain_person( 'ipr_test_3', 'Кузнецов', 'Дмитрий', 'Олегович' );
var xNsk = obtain_person( 'ipr_test_4', 'Белова', 'Анна', 'Викторовна' );
var xPicker1 = obtain_person( 'ipr_test_5', 'Тихонов', 'Игорь', 'Павлович' );
var xPicker2 = obtain_person( 'ipr_test_6', 'Зайцева', 'Ольга', 'Николаевна' );

set_position( xBossId, 'ipr_test_pos_boss', 'Управляющий', xAdm, 'Администрация СТЦ Тестовый', xOrgId, sOrgName, true );
set_position( xRop, 'ipr_test_pos_1', 'Руководитель отдела продаж', xHall, 'Торговый зал СТЦ Тестовый', xOrgId, sOrgName, true );
set_position( xSeller1, 'ipr_test_pos_2', 'Продавец-консультант', xHall, 'Торговый зал СТЦ Тестовый', xOrgId, sOrgName, false );
set_position( xSeller2, 'ipr_test_pos_3', 'Продавец-консультант', xHall, 'Торговый зал СТЦ Тестовый', xOrgId, sOrgName, false );
set_position( xNsk, 'ipr_test_pos_4', 'Начальник складского комплекса', xWh, 'Складской комплекс СТЦ Тестовый', xOrgId, sOrgName, true );
set_position( xPicker1, 'ipr_test_pos_5', 'Комплектовщик', xWh, 'Складской комплекс СТЦ Тестовый', xOrgId, sOrgName, false );
set_position( xPicker2, 'ipr_test_pos_6', 'Комплектовщик', xWh, 'Складской комплекс СТЦ Тестовый', xOrgId, sOrgName, false );

obtain_ipr( xSeller1, xRop, 'Кадровый резерв', 'В процессе', '31.12.2026', [ 'Лидерство', 'Ориентация на клиента' ], '' );
obtain_ipr( xSeller2, xRop, 'Опрос по ценностям', 'На согласовании', '30.11.2026', [ 'Слушай и откликайся' ], '' );
obtain_ipr( xPicker1, xNsk, 'Опрос по ценностям', 'Черновик', '31.12.2026', [ 'Проявляй волю' ], '' );
obtain_ipr( xRop, xBossId, 'Кадровый резерв', 'Завершено', '30.09.2026', [ 'Управление результатом' ], '' );
obtain_ipr( xRop, xBossId, 'Опрос по ценностям', 'Завершено', '30.09.2025', [ 'Действуй осознанно' ], '15.03.2025' );

RESULT = {
	stc_id: String( xStc ),
	user1_was: sBossWas,
	user1_now: 'Управляющий / Администрация СТЦ Тестовый'
};
