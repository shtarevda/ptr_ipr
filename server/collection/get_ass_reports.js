/**
 * Логирование
 * @param {string} value - значение для логирования
 * @param {string} name - название файла лога
 */
function addLog(value, name) {
    var sLogName = name
    if (sLogName == undefined) {
        sLogName = 'get_ass_reports'
    }

    EnableLog(sLogName)
    LogEvent(sLogName, value)
}

/**
 * Получить sql-строку, для получения списка ИПР
 * @param {string} userId - идентификатор пользователя
 * @param {object} settings
 * @return {array}
 */
function getQuery(userId) {
    // prettier-ignore
    return (
        " \
        DECLARE @user_id bigint = " +
            OptInt(userId) +
            " \
        SELECT DISTINCT aa.id, p.person_id, aa.name AS ass_name, YEAR(aa.start_date) AS year FROM assessment_appraises aa \
        INNER JOIN pas p ON p.assessment_appraise_id = aa.id AND p.person_id = @user_id \
        WHERE aa.name LIKE 'Опрос по ценностям%' \
        "
    )
}

/**
 * Получить список отчетов
 * @param {string} userId - идентификатор пользователя
 * @param {object} settings
 * @return {array}
 */
function getReports(userId) {
    var sSql = getQuery(userId)
    var aReports = XQuery('sql: ' + sSql)
    var aRes = []
    var oTemp = {}
    for (elem in aReports) {
        oTemp = {}
        oTemp.id = elem.id.Value
        oTemp.ass_name = elem.ass_name.Value
        oTemp.year = String(elem.year.Value)
        oTemp.link =
            'view_doc.html?mode=doc_type&custom_web_template_id=7350204124263891589&assessment_app_ids=' +
            elem.id.Value +
            '&coll_ids=' +
            elem.person_id.Value
        aRes.push(oTemp)
    }

    return ArraySort(aRes, 'This.year', '-')
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

    RESULT = getReports(user_id)
} catch (err) {
    ERROR = 1
    MESSAGE = String(err)
    RESULT = []
    addLog(err)
}
