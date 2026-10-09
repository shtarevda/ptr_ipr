import axios from 'axios'

const noAccess = { has_access: false, stc_name: '', persons: [], ipr: [] }

// один запрос на загрузку страницы: данные нужны и меню, и вкладке СТЦ
let cache = null

/**
 * Получить сотрудников СТЦ и их ИПР для управляющего
 * @param {object} settings - настройки приложения
 * @return {Promise<object>} - { has_access, stc_name, persons, ipr }
 */
const loadStcData = (settings) => {
    if (cache) {
        return cache
    }

    const requestBody = {
        action: 'collection',
        code: 'get_ipr_stc_list',
        wvars: {
            ...settings
        }
    }

    cache = axios
        .post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )
        .then((res) => {
            if (!res.data.success || res.data.data.results.length == 0) {
                return noAccess
            }
            const row = res.data.data.results[0]
            if (!row.has_access) {
                return noAccess
            }
            const data = row.result ? JSON.parse(row.result) : {}

            return {
                has_access: true,
                stc_name: row.stc_name,
                persons: data.persons || [],
                ipr: data.ipr || []
            }
        })
        .catch(() => noAccess)

    return cache
}

export default loadStcData
