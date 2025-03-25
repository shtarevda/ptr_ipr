try {
    // присваиваем переменным их начальное значение
    ERROR = 0
    MESSAGE = ''
    RESULT = {}

    var eduPlanID = OptInt(plan_id, undefined)
    if (eduPlanID == undefined) {
        throw 'Не указан id плана обучения'
    }
    var oData = {}
    if (str_json != undefined) {
        oData = tools.read_object(str_json)
    }

    var bOK = true
    var docEduPlan = tools.open_doc(eduPlanID)
    var sReturnValue = {}
    if (docEduPlan != undefined) {
        var aCompetences = ArraySelect(
            docEduPlan.TopElem.programs,
            'This.type == "folder"'
        )
        switch (oData.type) {
            case 'approval':
                docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                    'ipr_status'
                ).value = 'В процессе'
                break
            case 'on_approval':
                docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                    'ipr_status'
                ).value = 'На согласовании'
                break
            case 'custom':
                docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                    oData.field
                ).value = oData.value
                break
            case 'field':
                docEduPlan.TopElem.Child(oData.field).Value = oData.value
                break
            case 'competence':
                var child = docEduPlan.TopElem.programs.AddChild()
                child.type = oData.field
                child.plan_date = docEduPlan.TopElem.plan_date
                sReturnValue = {
                    id: child.id.Value,
                    name: '',
                    comment: '',
                    comp_id: '',
                    tasks: [],
                    collaborators: { persons: [], items: [] },
                    learnings: []
                }
                break
            case 'delete_program':
                for (elem in ArraySelect(
                    docEduPlan.TopElem.programs,
                    'This.parent_progpam_id == oData.value'
                )) {
                    docEduPlan.TopElem.programs.DeleteChildByKey(elem.id)
                }
                docEduPlan.TopElem.programs.DeleteChildByKey(oData.value)
                break
            case 'multi_collaborators_program':
                var program = undefined
                for (elem in ArraySelect(
                    docEduPlan.TopElem.programs,
                    'This.type == "material" && catalog_name == "chat" && This.parent_progpam_id == oData.field.parent_progpam_id'
                )) {
                    program = ArrayOptFind(
                        oData.value,
                        'OptInt(elem.tutor_id) == Int(This.id)'
                    )
                    if (program == undefined) {
                        docEduPlan.TopElem.programs.DeleteChildByKey(elem.id)
                    }
                }
                sReturnValue = []
                for (elem in oData.value) {
                    program = ArrayOptFind(
                        docEduPlan.TopElem.programs,
                        'OptInt(This.tutor_id) == Int(elem.id) && This.type == "material" && catalog_name == "chat" && This.parent_progpam_id == oData.field.parent_progpam_id'
                    )

                    if (program == undefined) {
                        program = docEduPlan.TopElem.programs.AddChild()
                        program.type = oData.field.field_type
                        program.parent_progpam_id = oData.field.parent_progpam_id
                        program.name = 'Развитие через других: ' + elem.fullname
                        program.create_date = Date()
                        program.plan_date = docEduPlan.TopElem.plan_date
                        program.tutor_id = elem.id
                        program.catalog_name = 'chat'
                        _sReturnValue = {
                            id: program.id.Value,
                            parent_progpam_id: oData.field.parent_progpam_id,
                            type: oData.field.field_type,
                            name: 'Развитие через других: ' + elem.fullname,
                            create_date: StrDate(program.create_date, false),
                            plan_date: StrDate(
                                docEduPlan.TopElem.plan_date,
                                false
                            ),
                            tutor_id: String(elem.id),
                            fullname: String(elem.fullname),
                            position_name: String(elem.position_name),
                            finish_date: '',
                            state_id: 0,
                            comment: ''
                        }
                        sReturnValue.push(_sReturnValue)
                    } else {
                        _sReturnValue = {
                            id: program.id.Value,
                            parent_progpam_id: program.parent_progpam_id.Value,
                            type: program.type.Value,
                            name: program.name.Value,
                            create_date: StrDate(program.create_date, false),
                            plan_date: StrDate(program.plan_date, false),
                            tutor_id: program.tutor_id.Value,
                            fullname: String(elem.fullname),
                            position_name: String(elem.position_name),
                            finish_date: program.finish_date.Value,
                            state_id: program.state_id.Value,
                            comment: program.comment.Value
                        }
                        sReturnValue.push(_sReturnValue)
                    }
                }
                break
            case 'program':
                var program = undefined
                if (oData.field.program_id == '') {
                    program = docEduPlan.TopElem.programs.AddChild()
                    program.type = oData.field.field_type
                    sName = ''
                    sTypeName = ''
                    sType = oData.field.field_type
                    if (oData.field.field_type == 'education_method') {
                        program.education_method_id = oData.value
                        program.plan_date = docEduPlan.TopElem.plan_date
                        oEdu = program.education_method_id.OptForeignElem
                        if (oEdu != undefined) {
                            sName = oEdu.name.Value
                            sType = oEdu.type.Value
                            sTypeName =
                                oEdu.type == 'course' ? 'Курс' : 'Мероприятие'
                            program.name = sName
                            program.type = sType
                        }
                    }
                    sReturnValue = {
                        id: program.id.Value,
                        parent_progpam_id: oData.field.parent_progpam_id,
                        type: sType,
                        type_name: sTypeName,
                        name: sName,
                        create_date: StrDate(program.create_date, false),
                        plan_date: '',
                        finish_date: '',
                        state_id: 0,
                        comment: '',
                        edu_program_id: oData.value
                    }
                } else {
                    program = ArrayOptFind(
                        docEduPlan.TopElem.programs,
                        'This.id == oData.field.program_id'
                    )
                }
                if (program != undefined) {
                    if (oData.field.parent_progpam_id != '') {
                        program.parent_progpam_id = oData.field.parent_progpam_id
                    }
                    switch (oData.field.type) {
                        case 'custom':
                            program.custom_elems.ObtainChildByKey(
                                oData.field.name
                            ).value = oData.value
                            break
                        case 'custom_comp':
                            program.custom_elems.ObtainChildByKey(
                                oData.field.name
                            ).value = oData.value
                            oComp = ArrayOptFirstElem(
                                XQuery(
                                    'for $elem in competences where $elem/id = ' +
                                        oData.value +
                                        ' return $elem/name'
                                )
                            )
                            if (oComp != undefined) {
                                program.name = oComp.name
                            }

                            break
                        case 'field':
                            program.Child(oData.field.name).Value = oData.value
                            break
                        case 'field_is_done':
                            program.Child(oData.field.name).Value = oData.value
                            if (oData.value != 0) {
                                program.finish_date = Date()
                            } else {
                                program.finish_date.Clear()
                            }
                            sReturnValue = {
                                is_done: oData.value != 0,
                                finish_date: StrDate(program.finish_date, false)
                            }
                            var aTasks = ArraySelect(
                                docEduPlan.TopElem.programs,
                                'This.type != "folder"'
                            )
                            var nTasks = ArrayCount(aTasks)
                            var nDoneTasks = ArrayCount(
                                ArraySelect(
                                    aTasks,
                                    'This.state_id == 4 || This.state_id == 2'
                                )
                            )

                            docEduPlan.TopElem.readiness_percent = StrReal(
                                (Real(nDoneTasks) / Real(nTasks)) * 100.0,
                                0
                            )

                            if (docEduPlan.TopElem.readiness_percent == 100) {
                                for (elem in aCompetences) {
                                    elem.state_id = 4
                                }
                                docEduPlan.TopElem.state_id = 4
                                docEduPlan.TopElem.finish_date = Date()
                                docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                                    'ipr_status'
                                ).value = 'Завершено'
                            } else {
                                sStatus =
                                    docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                                        'ipr_status'
                                    ).value
                                if (sStatus != 'В процессе') {
                                    docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                                        'ipr_status'
                                    ).value = 'В процессе'
                                    docEduPlan.TopElem.state_id = 1
                                    docEduPlan.TopElem.finish_date.Clear()
                                }
                            }
                            break
                    }
                }
                break
            default:
                bOK = false
        }

        if (bOK) {
            docEduPlan.Save()
        }
    }

    RESULT = {
        success: bOK,
        value: sReturnValue
    }
} catch (error) {
    ERROR = 1
    MESSAGE = String(error.message)
    RESULT = {
        success: false
    }
}
