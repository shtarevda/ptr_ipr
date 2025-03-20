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
 * Получить sql-строку, для получения списка ИПР
 * @param {string} userId - идентификатор пользователя
 * @param {object} settings
 * @return {array}
 */
function getQuery(userId) {
    // prettier-ignore
    return (
        " \
        declare @person_id bigint = "+OptInt(userId)+"; \
        WITH ipr_data AS ( \
            SELECT \
                CAST(ep.id AS varchar(20)) AS id, \
                ep2.data.value('(/education_plan/custom_elems/custom_elem[name=''ipr_type'']/value)[1]', 'varchar(500)') AS process_name, \
                (SELECT TOP 1 c.fullname FROM collaborators c WHERE c.id = ep2.data.value('(/education_plan/tutor_id)[1]', 'bigint')) AS boss_fullname, \
                FORMAT(ep.create_date, 'dd.MM.yyyy') AS create_date, \
                FORMAT(ep.plan_date, 'dd.MM.yyyy') AS plan_date, \
                FORMAT(ep.finish_date, 'dd.MM.yyyy') AS finish_date, \
                (SELECT TOP 1 CASE WHEN els.name = 'Назначен' THEN 'Черновик' END AS status_name FROM [common.education_learning_states] els WHERE els.id = ep.state_id) AS status_name, \
                CAST(ep.readiness_percent AS varchar(3)) AS readiness_percent, \
                ep2.data.value('(/education_plan/comment)[1]', 'varchar(max)') AS comment, \
                YEAR(ep.create_date) AS start_year \
            FROM education_plans ep \
            INNER JOIN education_plan ep2 ON ep2.id = ep.id \
            WHERE ep.code = 'ipr' AND ep.person_id = @person_id \
        ), \
        filter_data AS ( \
                    -- Формируем фильтры, собирая уникальные значения по каждому полю \
                    SELECT 'Год' AS title, 'start_year' AS label, \
                        JSON_QUERY('[' + STRING_AGG(CONCAT('\"', start_year, '\"'), ',') + ']') AS items \
                    FROM (SELECT DISTINCT start_year FROM ipr_data WHERE start_year IS NOT NULL) t \
                ) \
                SELECT  \
            JSON_QUERY( \
                ( \
                    SELECT  \
                        JSON_QUERY((SELECT * FROM ipr_data ORDER BY create_date FOR JSON PATH)) AS ipr, \
                        JSON_QUERY((SELECT * FROM filter_data FOR JSON PATH)) AS filters \
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER \
                ) \
            ) AS result \
        "
    )
}

/**
 * Получить списка ИПР
 * @param {string} userId - идентификатор пользователя
 * @param {object} settings
 * @return {array}
 */
function getListIPR(userId) {
    var sSql = getQuery(userId)
    var aIPRs = XQuery('sql: ' + sSql)

    return aIPRs
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

    RESULT = getListIPR(user_id)
} catch (err) {
    ERROR = 1
    MESSAGE = String(err)
    RESULT = []
    addLog(err)
}
