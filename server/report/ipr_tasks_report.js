// Аналитический отчёт «ИПР. Персональный отчёт»: строка = задача ИПР.
// Код поля custom_x настраиваемого отчёта (custom_report), возвращает массив строк.

/**
 * Статус ИПР для отчёта: до согласования план считается не начатым
 * @param {string} status - статус ИПР (ipr_status)
 * @return {string}
 */
function getPlanStatus(status) {
    if (status == 'Завершено' || status == 'В процессе') {
        return status
    }

    return 'Не начато'
}

/**
 * Тип задачи
 * @param {string} type - тип строки плана
 * @param {string} method - признак ipr_method (self - свой вариант саморазвития)
 * @return {string}
 */
function getTaskType(type, method) {
    if (method == 'self') {
        return 'Саморазвитие'
    }
    switch (type) {
        case 'learning_task':
            return 'Задача'
        case 'material':
            return 'Развитие через других'
        case 'org':
            return 'Мероприятие'
        case 'course':
            return 'Курс'
    }

    return ''
}

/**
 * Статус задачи
 * @param {string} type - тип строки плана (пусто, если задач нет)
 * @param {number} stateId - state_id строки плана
 * @return {string}
 */
function getTaskStatus(type, stateId) {
    if (type == '') {
        return ''
    }
    switch (OptInt(stateId, 0)) {
        case 1:
            return 'В процессе'
        case 2:
        case 4:
            return 'Пройдено'
        case 3:
            return 'Не пройдено'
        case 6:
            return 'Отменено'
    }

    return 'Согласовано'
}

/**
 * Собрать текст журнала общего комментария: «дата, автор: текст»
 * @param {string} json - значение ipr_comment_history
 * @return {string}
 */
function getHistoryText(json) {
    var aHistory = []
    var aLines = []
    var oItem = undefined
    var sWho = ''
    if (json == '') {
        return ''
    }
    try {
        aHistory = ParseJson(json)
    } catch (err) {
        return ''
    }
    for (oItem in aHistory) {
        sWho = oItem.GetOptProperty('date', '')
        if (oItem.GetOptProperty('person_fullname', '') != '') {
            sWho = sWho + ', ' + oItem.person_fullname
        }
        if (sWho == '') {
            sWho = 'Ранее'
        }
        aLines.push(
            sWho + ': ' + (oItem.comment == '' ? '(комментарий удалён)' : oItem.comment)
        )
    }

    return aLines.join('\n')
}

// prettier-ignore
var sSQL = " \
SELECT \
    CAST(ep.id AS varchar(20)) AS plan_id, \
    c.fullname AS person_fullname, \
    c.position_parent_name AS subdivision_name, \
    pv.ipr_type, \
    pv.ipr_status, \
    (SELECT TOP 1 b.fullname FROM collaborators b WHERE b.id = pv.tutor_id) AS boss_fullname, \
    FORMAT(ep.create_date, 'dd.MM.yyyy') AS create_date, \
    FORMAT(ep.plan_date, 'dd.MM.yyyy') AS plan_date, \
    pv.plan_comment, \
    pv.comment_history, \
    fx.comp_name, \
    tx.task_name, \
    tx.task_type, \
    tx.task_method, \
    FORMAT(tx.task_plan_date, 'dd.MM.yyyy') AS task_plan_date, \
    tx.task_comment, \
    tx.task_state \
FROM education_plans ep \
INNER JOIN education_plan ep2 ON ep2.id = ep.id \
INNER JOIN collaborators c ON c.id = ep.person_id \
CROSS APPLY ( \
    SELECT \
        ep2.data.value('(/education_plan/custom_elems/custom_elem[name=''ipr_type'']/value)[1]', 'varchar(500)') AS ipr_type, \
        ep2.data.value('(/education_plan/custom_elems/custom_elem[name=''ipr_status'']/value)[1]', 'varchar(100)') AS ipr_status, \
        ep2.data.value('(/education_plan/custom_elems/custom_elem[name=''ipr_comment_history'']/value)[1]', 'nvarchar(max)') AS comment_history, \
        ep2.data.value('(/education_plan/tutor_id)[1]', 'bigint') AS tutor_id, \
        ep2.data.value('(/education_plan/comment)[1]', 'nvarchar(max)') AS plan_comment \
) pv \
OUTER APPLY ( \
    SELECT \
        F.c.value('(id)[1]', 'bigint') AS comp_id, \
        F.c.value('(name)[1]', 'nvarchar(500)') AS comp_name \
    FROM ep2.data.nodes('/education_plan/programs/program[type=\"folder\"]') AS F(c) \
) fx \
OUTER APPLY ( \
    SELECT \
        T.c.value('(name)[1]', 'nvarchar(1000)') AS task_name, \
        T.c.value('(type)[1]', 'varchar(50)') AS task_type, \
        T.c.value('(custom_elems/custom_elem[name=\"ipr_method\"]/value)[1]', 'varchar(50)') AS task_method, \
        T.c.value('(plan_date)[1]', 'datetime') AS task_plan_date, \
        T.c.value('(comment)[1]', 'nvarchar(max)') AS task_comment, \
        T.c.value('(state_id)[1]', 'int') AS task_state \
    FROM ep2.data.nodes('/education_plan/programs/program[parent_progpam_id = sql:column(\"fx.comp_id\")]') AS T(c) \
) tx \
WHERE ep.code = 'ipr' \
ORDER BY c.fullname, ep.create_date, fx.comp_id \
"

var aRes = []
var pk = 0
var elem = undefined
var r = undefined
var sTaskType = ''
var oHistoryCache = {}
var sHistory = ''

for (elem in XQuery('sql: ' + sSQL)) {
    // журнал комментариев один на план - разбираем его один раз
    if (oHistoryCache.HasProperty(String(elem.plan_id))) {
        sHistory = oHistoryCache.GetProperty(String(elem.plan_id))
    } else {
        sHistory = getHistoryText(String(elem.comment_history))
        oHistoryCache.SetProperty(String(elem.plan_id), sHistory)
    }
    sTaskType = String(elem.task_type)

    r = new Object()
    r.SetProperty('PrimaryKey', String(pk))
    r.SetProperty('person_fullname', String(elem.person_fullname))
    r.SetProperty('subdivision_name', String(elem.subdivision_name))
    r.SetProperty('ipr_type', String(elem.ipr_type))
    r.SetProperty('boss_fullname', String(elem.boss_fullname))
    r.SetProperty('create_date', String(elem.create_date))
    r.SetProperty('plan_date', String(elem.plan_date))
    r.SetProperty('ipr_status', getPlanStatus(String(elem.ipr_status)))
    r.SetProperty('comp_name', String(elem.comp_name))
    r.SetProperty('task_name', String(elem.task_name))
    r.SetProperty('task_type', getTaskType(sTaskType, String(elem.task_method)))
    r.SetProperty('task_plan_date', String(elem.task_plan_date))
    r.SetProperty('task_comment', String(elem.task_comment))
    r.SetProperty('plan_comment', String(elem.plan_comment))
    r.SetProperty('comment_history', sHistory)
    r.SetProperty('task_status', getTaskStatus(sTaskType, elem.task_state))
    pk++
    aRes.push(r)
}

return aRes
