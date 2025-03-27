/**
 * Логирование
 * @param {string} value - значение для логирования
 * @param {string} name - название файла лога
 */
function addLog(value, name) {
    var sLogName = name
    if (sLogName == undefined) {
        sLogName = 'get_view_ipr'
    }

    EnableLog(sLogName)
    LogEvent(sLogName, value)
}

/**
 * Получить итоговый список программ ИПР
 * @param {string} eduPlanID - идентификатор плана обучения
 * @return {array}
 */
function getStatusByID(state_id) {
    sStatus = ''
    switch (state_id) {
        case 0:
            sStatus = 'Черновик'
            break
        case 1:
            sStatus = 'В процессе'
            break
        case 2:
        case 4:
            sStatus = 'Завершено'
            break
        case 3:
            sStatus = 'Не пройден'
            break
        case 5:
            sStatus = 'На согласовании'
            break
        case 6:
            sStatus = 'Отменен'
            break
    }
    return sStatus
}

/**
 * Получить итоговый список программ ИПР
 * @param {string} eduPlanID - идентификатор плана обучения
 * @return {array}
 */
function getViewIPR(eduPlanID) {
    var docEduPlan = tools.open_doc(eduPlanID)
    var oResult = {}
    var oItem = {}
    var i = 1
    if (docEduPlan != undefined) {
        oResult.id = eduPlanID
        oResult.process =
            docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                'ipr_type'
            ).value.Value
        oResult.boss = []
        oResult.cur_user_is_boss = false
        oResult.state_id = docEduPlan.TopElem.state_id.Value
        oResult.status =
            docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                'ipr_status'
            ).value.Value
        oResult.can_edit =
            oResult.status == 'В процессе' || oResult.status == 'Завершено'
        oResult.comment = docEduPlan.TopElem.comment.Value
        if (docEduPlan.TopElem.tutor_id.HasValue) {
            oResult.cur_user_is_boss = curUserID == docEduPlan.TopElem.tutor_id
            oBoss = docEduPlan.TopElem.tutor_id.OptForeignElem
            if (oBoss != undefined) {
                oResult.boss.push({
                    id: String(oBoss.id),
                    fullname: String(oBoss.fullname),
                    position_name: String(oBoss.position_name),
                    position_parent_name: String(oBoss.position_parent_name),
                    org_name: String(oBoss.org_name)
                })
            }
        }
        oResult.plan_date = StrDate(docEduPlan.TopElem.plan_date.Value, false)
        oResult.programs = []
        for (elem in ArraySelect(
            docEduPlan.TopElem.programs,
            'This.type == "folder"'
        )) {
            for (task in ArraySelect(
                docEduPlan.TopElem.programs,
                'This.parent_progpam_id == elem.id'
            )) {
                oItem = {}
                oItem.comp_program_id = elem.id.Value
                oItem.comp_name = elem.name.Value
                oItem.comp_target = elem.comment.Value
                comp_id = OptInt(
                    elem.custom_elems.ObtainChildByKey('comp_id').value.Value,
                    ''
                )
                oItem.comp_id = comp_id == '' ? '' : StrInt(comp_id)
                oItem.index = i
                oItem.id = task.id.Value
                oItem.parent_progpam_id = task.parent_progpam_id.Value
                oItem.type = task.type.Value
                oItem.name = task.name.Value
                oItem.create_date = StrDate(task.create_date.Value, false)
                oItem.plan_date = StrDate(task.plan_date.Value, false)
                oItem.finish_date = StrDate(task.finish_date.Value, false)
                oItem.state_id = task.state_id.Value
                oItem.program_status =
                    task.state_id.Value == 2 ? 4 : task.state_id.Value
                oItem.comment = task.comment.Value
                oResult.programs.push(oItem)
                i++
            }
        }
    }

    return [oResult]
}

// entry point
try {
    ERROR = 0
    MESSAGE = ''

    /*
    var path = 'x-local://wt/web/custom_projects/ipr/'
    var file = 'ipr_lib.js'
    var LIB = OpenCodeLib(path + file)
    */

    if (plan_id == undefined || plan_id == '') {
        throw 'Не указан ID плана обучения'
    }

    RESULT = getViewIPR(plan_id)
} catch (err) {
    ERROR = 1
    MESSAGE = String(err)
    RESULT = []
    addLog(err)
}
