/**
 * Логирование
 * @param {string} value - значение для логирования
 * @param {string} name - название файла лога
 */
function addLog(value, name) {
    var sLogName = name
    if (sLogName == undefined) {
        sLogName = 'get_ipr_learnings'
    }

    EnableLog(sLogName)
    LogEvent(sLogName, value)
}

/**
 * Получить список учебных программ для ИПР
 * @return {array}
 */
function getLearnings() {
    var sSQL =
        " \
            SELECT \
                em.id,  \
                em.name,  \
                em.type,  \
                em.course_id,  \
                em2.data.value('(/education_method/desc)[1]', 'varchar(max)') AS [desc],  \
                CONCAT('/download_file.html?file_id=', em2.data.value('(/education_method/resource_id)[1]', 'varchar(100)')) AS img,  \
                em2.data.value('(/education_method/resource_id)[1]', 'varchar(100)') AS resource_id,  \
                em2.data.value('(/education_method/comment)[1]', 'varchar(max)') AS short_desc, \
                STUFF(( \
                    SELECT ', ' + T.c.value('.', 'varchar(max)') \
                    FROM em2.data.nodes('//competences/competence/competence_id') AS T(c) \
                    FOR XML PATH(''), TYPE).value('.', 'varchar(max)'), 1, 2, '') AS competence_ids \
            FROM education_methods em  \
            INNER JOIN education_method em2 ON em2.id = em.id \
            WHERE em.code IN ('course_ipr', 'event_ipr') \
    "
    var aLearnings = ArraySelectAll(XQuery('sql: ' + sSQL))
    return aLearnings
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

    RESULT = getLearnings(competence_id)
} catch (err) {
    ERROR = 1
    MESSAGE = String(err)
    RESULT = []
    addLog(err)
}
