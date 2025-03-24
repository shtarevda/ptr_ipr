/**
 * Логирование
 * @param {string} value - значение для логирования
 * @param {string} name - название файла лога
 */
function addLog(value, name) {
    var sLogName = name
    if (sLogName == undefined) {
        sLogName = 'get_ipr_list'
    }

    EnableLog(sLogName)
    LogEvent(sLogName, value)
}

/**
 * Получить ИПР
 * @param {string} eduPlanID - идентификатор плана обучения
 * @return {array}
 */
function getIPR(eduPlanID) {
    var docEduPlan = tools.open_doc(eduPlanID)
    var oResult = {}
    var oItem = {}
    var oTask = {}
    if (docEduPlan != undefined) {
        oResult.id = eduPlanID
        oResult.process =
            docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                'ipr_type'
            ).value.Value
        oResult.boss = []
        if (docEduPlan.TopElem.tutor_id.HasValue) {
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
        oResult.competences = []
        for (elem in ArraySelect(
            docEduPlan.TopElem.programs,
            'This.type == "folder"'
        )) {
            oItem = {}
            oItem.id = elem.id.Value
            oItem.name = elem.name.Value
            oItem.comment = elem.comment.Value
            comp_id = OptInt(
                elem.custom_elems.ObtainChildByKey('comp_id').value.Value,
                ''
            )
            oItem.comp_id = comp_id == '' ? '' : StrInt(comp_id)
            oItem.tasks = []
            oItem.collaborators = { persons: [], items: [] }
            oItem.learnings = []

            for (task in ArraySelect(
                docEduPlan.TopElem.programs,
                'This.parent_progpam_id == elem.id'
            )) {
                oTask = {}
                oTask.id = task.id.Value
                oTask.parent_progpam_id = task.parent_progpam_id.Value
                oTask.type = task.type.Value
                oTask.name = task.name.Value
                oTask.create_date = StrDate(task.create_date.Value, false)
                oTask.plan_date = StrDate(task.plan_date.Value, false)
                oTask.finish_date = StrDate(task.finish_date.Value, false)
                oTask.state_id = task.state_id.Value
                oTask.comment = task.comment.Value
                switch (task.type) {
                    case 'learning_task':
                        oItem.tasks.push(oTask)
                        break
                    case 'material':
                        if (task.tutor_id.HasValue) {
                            oPerson = task.tutor_id.OptForeignElem
                            if (oPerson != undefined) {
                                oTask.tutor_id = String(oPerson.id)
                                oTask.fullname = String(oPerson.fullname)
                                oTask.position_name = String(oPerson.position_name)
                                oItem.collaborators.persons.push({
                                    id: String(oPerson.id),
                                    fullname: String(oPerson.fullname),
                                    position_name: String(oPerson.position_name),
                                    position_parent_name: String(
                                        oPerson.position_parent_name
                                    ),
                                    org_name: String(oPerson.org_name)
                                })
                            }
                        }
                        oItem.collaborators.items.push(oTask)
                        break
                    case 'course':
                    case 'education_method':
                        oItem.learnings.push(oTask)
                        break
                }
            }

            oResult.competences.push(oItem)
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
    var user_id = curUserID
    if (person_id != undefined && person_id != '') {
        user_id = person_id
    }
    if (plan_id == undefined || plan_id == '') {
        throw 'Не указан ID плана обучения'
    }

    RESULT = getIPR(plan_id)
} catch (err) {
    ERROR = 1
    MESSAGE = String(err)
    RESULT = []
    addLog(err)
}
