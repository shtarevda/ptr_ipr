/**
 * Логирование
 * @param {string} value - значение для логирования
 * @param {string} name - название файла лога
 */
function addLog(value, name) {
    var sLogName = name
    if (sLogName == undefined) {
        sLogName = 'get_ipr_admin_search'
    }

    EnableLog(sLogName)
    LogEvent(sLogName, value)
}

/**
 * Проверить, что пользователь - администратор WebTutor
 * или входит в группу администраторов кадрового резерва
 * @param {string} userId - идентификатор пользователя
 * @return {boolean}
 */
function isAdmin(userId) {
    // prettier-ignore
    var sSQL = " \
        SELECT c.id \
        FROM collaborators c \
        WHERE c.id = " + OptInt(userId) + " \
            AND ( \
                c.role_id = 'admin' \
                OR EXISTS ( \
                    SELECT 1 \
                    FROM group_collaborators gc \
                    INNER JOIN groups g ON g.id = gc.group_id \
                    WHERE gc.collaborator_id = c.id \
                        AND g.code = 'admin_caree_ reserve' \
                ) \
            ) \
    "
    return ArrayOptFirstElem(XQuery('sql: ' + sSQL)) != undefined
}

/**
 * Получить sql-строку для поиска ИПР по ФИО сотрудника
 * @param {string} search - часть ФИО
 * @return {string}
 */
function getQuery(search) {
    // prettier-ignore
    return (
        " \
        declare @search nvarchar(200) = " + SqlLiteral(search) + "; \
        WITH ipr_data AS ( \
            SELECT TOP 200 \
                CAST(ep.id AS varchar(20)) AS id, \
                c.fullname AS person_fullname, \
                c.position_name, \
                c.position_parent_name AS subdivision_name, \
                c.is_dismiss, \
                ep2.data.value('(/education_plan/custom_elems/custom_elem[name=''ipr_type'']/value)[1]', 'varchar(500)') AS process_name, \
                (SELECT TOP 1 b.fullname FROM collaborators b WHERE b.id = ep2.data.value('(/education_plan/tutor_id)[1]', 'bigint')) AS boss_fullname, \
                ep.create_date AS cr_date, \
                FORMAT(ep.create_date, 'dd.MM.yyyy') AS create_date, \
                FORMAT(ep.plan_date, 'dd.MM.yyyy') AS plan_date, \
                ep2.data.value('(/education_plan/custom_elems/custom_elem[name=''ipr_status'']/value)[1]', 'varchar(100)') AS status_name, \
                YEAR(ep.create_date) AS start_year \
            FROM education_plans ep \
            INNER JOIN education_plan ep2 ON ep2.id = ep.id \
            INNER JOIN collaborators c ON c.id = ep.person_id \
            WHERE ep.code = 'ipr' \
                AND c.fullname LIKE '%' + @search + '%' \
            ORDER BY c.fullname, ep.create_date DESC \
        ) \
        SELECT \
            JSON_QUERY((SELECT * FROM ipr_data ORDER BY person_fullname, cr_date DESC FOR JSON PATH)) AS result \
        "
    )
}

/**
 * Найти ИПР по ФИО сотрудника (только для администраторов).
 * Пустая строка поиска возвращает только признак доступа
 * @param {string} userId - идентификатор пользователя
 * @param {string} search - часть ФИО, не короче 3 символов
 * @return {array}
 */
function searchIPR(userId, search) {
    var sSearch = Trim(String(search))
    if (!isAdmin(userId)) {
        return [{ has_access: false }]
    }
    if (StrCharCount(sSearch) < 3) {
        return [{ has_access: true, result: '' }]
    }

    var oData = ArrayOptFirstElem(XQuery('sql: ' + getQuery(sSearch)))
    return [
        {
            has_access: true,
            result: oData != undefined ? String(oData.result) : ''
        }
    ]
}

// entry point
try {
    ERROR = 0
    MESSAGE = ''

    RESULT = searchIPR(curUserID, search)
} catch (err) {
    ERROR = 1
    MESSAGE = String(err)
    RESULT = []
    addLog(err)
}
