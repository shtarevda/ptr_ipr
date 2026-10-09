/**
 * Логирование
 * @param {string} value - значение для логирования
 * @param {string} name - название файла лога
 */
function addLog(value, name) {
    var sLogName = name
    if (sLogName == undefined) {
        sLogName = 'get_ipr_stc_list'
    }

    EnableLog(sLogName)
    LogEvent(sLogName, value)
}

/**
 * Получить СТЦ, которым управляет пользователь.
 * Управляющий числится в дочернем подразделении (администрация СТЦ),
 * поэтому СТЦ - это родительское подразделение его должности
 * @param {string} userId - идентификатор пользователя
 * @return {XmElem | undefined} - id и name подразделения СТЦ
 */
function getStc(userId) {
    // prettier-ignore
    var sSQL = " \
        SELECT CAST(p.id AS varchar(20)) AS id, p.name \
        FROM collaborators c \
        INNER JOIN subdivisions s ON s.id = c.position_parent_id \
        INNER JOIN subdivisions p ON p.id = s.parent_object_id \
        WHERE c.id = " + OptInt(userId) + " \
            AND c.position_name = N'Управляющий' \
            AND p.name LIKE N'СТЦ %' \
    "
    return ArrayOptFirstElem(XQuery('sql: ' + sSQL))
}

/**
 * Получить sql-строку: сотрудники СТЦ (все дочерние подразделения) и их ИПР
 * @param {string} stcId - идентификатор подразделения СТЦ
 * @return {string}
 */
function getQuery(stcId) {
    // prettier-ignore
    return (
        " \
        declare @stc_id bigint = " + OptInt(stcId) + "; \
        WITH tree AS ( \
            SELECT s.id, s.name FROM subdivisions s WHERE s.id = @stc_id \
            UNION ALL \
            SELECT s.id, s.name FROM subdivisions s \
            INNER JOIN tree t ON s.parent_object_id = t.id \
        ), \
        person_data AS ( \
            SELECT \
                c.id AS person_id, \
                c.fullname, \
                c.position_name, \
                t.name AS subdivision_name \
            FROM collaborators c \
            INNER JOIN tree t ON t.id = c.position_parent_id \
            WHERE c.is_dismiss = 0 \
        ), \
        ipr_data AS ( \
            SELECT \
                CAST(ep.id AS varchar(20)) AS id, \
                CAST(ep.person_id AS varchar(20)) AS person_id, \
                ep2.data.value('(/education_plan/custom_elems/custom_elem[name=''ipr_type'']/value)[1]', 'varchar(500)') AS process_name, \
                (SELECT TOP 1 c.fullname FROM collaborators c WHERE c.id = ep2.data.value('(/education_plan/tutor_id)[1]', 'bigint')) AS boss_fullname, \
                ep.create_date AS cr_date, \
                FORMAT(ep.create_date, 'dd.MM.yyyy') AS create_date, \
                FORMAT(ep.plan_date, 'dd.MM.yyyy') AS plan_date, \
                FORMAT(ep.finish_date, 'dd.MM.yyyy') AS finish_date, \
                ep2.data.value('(/education_plan/custom_elems/custom_elem[name=''ipr_status'']/value)[1]', 'varchar(100)') AS status_name, \
                CAST(ep.readiness_percent AS varchar(3)) AS readiness_percent, \
                YEAR(ep.create_date) AS start_year, \
                STUFF(( \
                    SELECT '; ' + T.c.value('(name)[1]', 'varchar(500)') \
                    FROM ep2.data.nodes('/education_plan/programs/program[type=\"folder\"]') AS T(c) \
                    FOR XML PATH(''), TYPE).value('.', 'varchar(max)'), 1, 2, '') AS competences \
            FROM education_plans ep \
            INNER JOIN education_plan ep2 ON ep2.id = ep.id \
            WHERE ep.code = 'ipr' \
                AND ep.person_id IN (SELECT pd.person_id FROM person_data pd) \
        ) \
        SELECT \
            JSON_QUERY( \
                ( \
                    SELECT \
                        JSON_QUERY((SELECT CAST(pd.person_id AS varchar(20)) AS id, pd.fullname, pd.position_name, pd.subdivision_name FROM person_data pd ORDER BY pd.fullname FOR JSON PATH)) AS persons, \
                        JSON_QUERY((SELECT * FROM ipr_data ORDER BY cr_date DESC FOR JSON PATH)) AS ipr \
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER \
                ) \
            ) AS result \
        "
    )
}

/**
 * Получить сотрудников СТЦ и их ИПР для управляющего
 * @param {string} userId - идентификатор пользователя
 * @return {array}
 */
function getStcList(userId) {
    var oStc = getStc(userId)
    if (oStc == undefined) {
        return [{ has_access: false }]
    }

    var oData = ArrayOptFirstElem(XQuery('sql: ' + getQuery(oStc.id)))
    return [
        {
            has_access: true,
            stc_name: String(oStc.name),
            result: oData != undefined ? String(oData.result) : ''
        }
    ]
}

// entry point
try {
    ERROR = 0
    MESSAGE = ''

    RESULT = getStcList(curUserID)
} catch (err) {
    ERROR = 1
    MESSAGE = String(err)
    RESULT = []
    addLog(err)
}
