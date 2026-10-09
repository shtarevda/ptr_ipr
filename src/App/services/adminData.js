import axios from 'axios'

// признак доступа запрашивается один раз на загрузку страницы
let accessCache = null

/**
 * Найти ИПР по ФИО сотрудника (для администраторов)
 * @param {object} settings - настройки приложения
 * @param {string} search - часть ФИО; пустая строка - только проверка доступа
 * @return {Promise<object>} - { has_access, rows }
 */
const searchAdminIPR = (settings, search) => {
    const requestBody = {
        action: 'collection',
        code: 'get_ipr_admin_search',
        wvars: {
            ...settings,
            search: search
        }
    }

    return axios
        .post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )
        .then((res) => {
            if (!res.data.success || res.data.data.results.length == 0) {
                return { has_access: false, rows: [] }
            }
            const row = res.data.data.results[0]

            return {
                has_access: !!row.has_access,
                rows: row.result ? JSON.parse(row.result) : []
            }
        })
        .catch(() => ({ has_access: false, rows: [] }))
}

/**
 * Проверить, доступна ли пользователю выгрузка ИПР сотрудников
 * @param {object} settings - настройки приложения
 * @return {Promise<boolean>}
 */
const loadAdminAccess = (settings) => {
    if (!accessCache) {
        accessCache = searchAdminIPR(settings, '').then((data) => data.has_access)
    }

    return accessCache
}

export { searchAdminIPR, loadAdminAccess }
