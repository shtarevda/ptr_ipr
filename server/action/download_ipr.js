try {
    // присваиваем переменным их начальное значение
    ERROR = 0
    MESSAGE = ''
    RESULT = {}

    if (plan_id == undefined || OptInt(plan_id, 0) == 0) {
        throw 'Не передан идентификатор объекта'
    }
    if (print_form_id == undefined || String(print_form_id) == '') {
        throw 'Не передан идентификатор печатной формы'
    }
    var oPrintForm = ArrayOptFirstElem(
        XQuery(
            'for $elem in print_forms where $elem/id = ' +
                print_form_id +
                ' return $elem'
        )
    )
    if (oPrintForm == undefined) {
        throw 'Не найдена печатная форма'
    }
    var CirtificateName = oPrintForm.name

    //formDocID = formDoc.PrimaryKey

    _res = CallServerMethod('tools', 'process_print_form', [
        RValue(print_form_id),
        RValue(Int(plan_id)),
        false
    ])

    url_temp_folder = 'x-local://wt/web/custom_projects/ipr/print_form'
    ObtainDirectory(url_temp_folder)
    temp_folder = UrlToFilePath(url_temp_folder)
    file_name = CirtificateName + '.pdf'

    PutFileData(temp_folder + '/' + file_name, _res)

    RESULT = {
        link: StrReplace(
            StrReplace(temp_folder + '\\' + file_name, '\\', '/'),
            'C:/Program Files/WebSoft/WebTutorServer/wt/web',
            ''
        ),
        filename: file_name,
        success: true
    }
} catch (error) {
    ERROR = 1
    MESSAGE = String(error.message)
    RESULT = {
        success: false
    }
}
