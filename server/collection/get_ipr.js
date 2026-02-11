/**
 * Логирование
 * @param {string} value - значение для логирования
 * @param {string} name - название файла лога
 */
function addLog(value, name) {
    var sLogName = name
    if (sLogName == undefined) {
        sLogName = 'get_ipr'
    }

    EnableLog(sLogName)
    LogEvent(sLogName, value)
}

function getProcessesInCurYear(userId) {
    var sSQL =
        ' \
    declare @person_id bigint = ' +
        OptInt(userId) +
        "; \
            SELECT \
                CAST(ep.id AS varchar(20)) AS id, \
                ep2.data.value('(/education_plan/custom_elems/custom_elem[name=''ipr_type'']/value)[1]', 'varchar(500)') AS process_name \
            FROM education_plans ep \
            INNER JOIN education_plan ep2 ON ep2.id = ep.id \
            WHERE ep.code = 'ipr' AND ep.person_id = @person_id AND YEAR(ep.create_date) = YEAR(GETDATE()) \
    "
    return ArraySelectAll(XQuery('sql: ' + sSQL))
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
    var aProcesses = []
    if (docEduPlan != undefined) {
        sCurPlanStatus =
            docEduPlan.TopElem.custom_elems.ObtainChildByKey('ipr_status').value
        aProcesses = getProcessesInCurYear(docEduPlan.TopElem.person_id.Value)
        oResult.id = eduPlanID
        oResult.has_ass_process =
            ArrayOptFind(
                aProcesses,
                'This.process_name == "Опрос по ценностям"'
            ) != undefined
        oResult.has_reserve_process =
            ArrayOptFind(aProcesses, 'This.process_name == "Кадровый резерв"') !=
            undefined
        oResult.cur_user_id = docEduPlan.TopElem.person_id.Value
        oResult.process =
            docEduPlan.TopElem.custom_elems.ObtainChildByKey(
                'ipr_type'
            ).value.Value
        oResult.boss = []
        oResult.can_delete = sCurPlanStatus == 'Черновик'
        if (docEduPlan.TopElem.tutor_id.HasValue) {
            oBoss = docEduPlan.TopElem.tutor_id.OptForeignElem
            if (oBoss != undefined) {
                oResult.can_delete =
                    (docEduPlan.TopElem.tutor_id.Value == curUserID &&
                        (sCurPlanStatus == 'Черновик' ||
                            sCurPlanStatus == 'На согласовании')) ||
                    (docEduPlan.TopElem.person_id.Value == curUserID &&
                        sCurPlanStatus == 'Черновик')
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
        var aCompetences = ArraySelect(
            docEduPlan.TopElem.programs,
            'This.type == "folder"'
        )
        oResult.competences = []
        for (elem in aCompetences) {
            oItem = {}
            oItem.id = elem.id.Value
            oItem.name = elem.name.Value
            oItem.comment = elem.comment.Value
            oItem.result =
                elem.custom_elems.ObtainChildByKey('ipr_result').value.Value
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
                oTask.type_name = task.type == 'course' ? 'Курс' : 'Мероприятие'
                oTask.edu_program_id = task.education_method_id.Value
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
    oResult.default_ass_competentes = [
        {
            value: '7335364727859933182',
            label: 'Слушай и откликайся'
        },
        {
            value: '7335364727893263821',
            label: 'Проявляй волю'
        },
        {
            value: '7335364727923484114',
            label: 'Интересуйся технологиями'
        },
        {
            value: '7335364728305510084',
            label: 'Будь лучше себя вчерашнего'
        },
        {
            value: '7335364728312309329',
            label: 'Ищи возможности для улучшений'
        },
        {
            value: '7335364728682330123',
            label: 'Действуй осознанно'
        },
        {
            value: '7335364729076808748',
            label: 'Помогай и поддерживай'
        },
        {
            value: '7335364729080191987',
            label: 'Создавай условия и рабочую атмосферу'
        },
        {
            value: '7335364729086816643',
            label: 'Признавай свои ошибки. Признавай право других на ошибки'
        },
        {
            value: '7605603723791908442',
            label: 'Другое'
        }
    ]
    oResult.default_cr_competentes = [
        {
            value: '7169363109503248584',
            label: 'Лидерство'
        },
        {
            value: '7188092774817817456',
            label: 'Стрессоустойчивость'
        },
        {
            value: '7210440707555455770',
            label: 'Эффективное взаимодействие'
        },
        {
            value: '7144597146954245684',
            label: 'Анализ информации и решение проблем'
        },
        {
            value: '7226637950542901752',
            label: 'Управление процессами'
        },
        {
            value: '7169363110027778276',
            label: 'Управление результатом'
        },
        {
            value: '7144596667400451008',
            label: 'Ориентация на клиента'
        },
        {
            value: '7210440707087177148',
            label: 'Открытость к изменениям'
        },
        {
            value: '7605606505720595166',
            label: 'Стратегическое и системное мышление'
        },
        {
            value: '7605603723791908442',
            label: 'Другое'
        }
    ]
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
