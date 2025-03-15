import { API_URL } from './constants';


/**
 * Распарсить поля json у объекта
 * @param {object} obj - исходный объект
 * @param {array} fields - поля, которые требуют парсинга
 * @return {object}
 */
function parseJson(obj, fields) {
    var result = obj;

    for (var i = 0; i <= fields.length; i++) {
        var value = result[fields[i]];
        if (!value) {
            continue;
        }

        result[fields[i]] = JSON.parse(value);
    }

    return result;
}


/**
 * Получение параметров из адресной строки
 * @param {string} name - параметр в адресной строке
 * @param {string} url - адрес (необязательный параметр)
 * @return {string}
 */
function getQueryParameter(name, url) {
    let sUrl = url;
    if (!sUrl) {
        sUrl = window.location.href;
    }
    
    const paramName = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + paramName + '(=([^&#]*)|&|#|$)');

    const results = regex.exec(sUrl);
    if (!results) {
        return null;
    }
    
    if (!results[2]) {
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


/**
 *
 * @typedef {Object} AuthorizeStatus
 * @property {bool} error status
 * @property { string } message
 */
/**
 * function checks is user aouthorized on site
 * @param { Object } xhr xhr object from Ajax request
 * @returns { AuthorizeStatus } object with status
 */
function checkAuthorization(xhr) {
    let message = '';
    let error = false;
    const server = xhr.getResponseHeader('server');
    if (server.indexOf('WebSEAL') != -1) {
        message = 'Истекло время подключения, перезагрузите, страницу!';
        error = true;
    }

    return {
        error,
        message,
    };
}

// function buildRouteObject() {
//     const route = location.hash.substr(1);
//     if (route === '') {
//         return [{ name: '' }];
//     }

//     const routs = route.split('/');

//     return routs.map((r) => {
//         let pattern = /^(.*[a-z])\?(.*)/g;

//         if (pattern.exec(r) === null) {
//             return {
//                 originStr: r,
//                 name: r,
//                 params: {},
//             };
//         }
//         let [originStr, name, queryStr] = pattern.exec(r);
//         let params = execQueryParams(queryStr);
//         return {
//             originStr,
//             name,
//             params,
//         };
//     });
// }

function execQueryParams(params) {
    return (params.match(new RegExp('([^?=&]+)(=([^&]*))?', 'g')) || []).reduce(function (result, each, n, every) {
        let [key, value] = each.split('=');
        result[key] = value;
        return result;
    }, {});
}

/**
 * Check is mobile layout
 */
function isMobile() {
    const checkStrings = ['(max-width: 575.98px)', '(max-width: 768.98px)'];
    let isMobile = false;
    if (window.matchMedia) {
        checkStrings.forEach((s) => {
            if (window.matchMedia(s).matches) {
                isMobile = true;
            }
        });
    }

    return isMobile;
}

/**
 * @callback debounceCallBack
 * @param {object } args
 */
/**
 *
 * @param { debounceCallBack } callback
 * @param { int } delay
 */
function debounce(callback, delay = 250) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            timeoutId = null;
            callback(...args);
        }, delay);
    };
}

/**
 *
 * @param { Object } params - набор параметров для передачи
 * @param { Function } resolve - функция, которая будет вызвана если запрос выполнится успешно
 * @param { Function } reject - функция, которая будет вызвана если запрос выполнился не успешно
 */
function apiRequest(params, resolve, reject) {
    const userId = getQueryParameter('userId');
    const { type, code, wvars } = params;

    // предопределенные переменные, что бы каждый раз их не задавать
    const defaultWvars = {
        userId: userId,
        is_data_grid: 'true',
    };

    // нужно определять тип удаленного действия
    let codeTypeParam = { action_code: code };
    if (type === 'collection') {
        codeTypeParam = { collection_code: code };
    }

    // собираем параметры запроса
    let requestParams = {
        ...codeTypeParam,
        wvars: { ...defaultWvars, ...wvars },
    };

    let paramsToUpload = {
        action_type: type,
        params: JSON.stringify(requestParams),
    };

    $.ajax({
        url: API_URL,
        data: paramsToUpload,
        cache: false,
        type: 'GET',
        dataType: 'JSON',
    })
        .done((data, status, xhr) => {
            const isAuthorized = checkAuthorization(xhr);
            if (isAuthorized.error) {
                reject(isAuthorized);
                return;
            } else if (data.error === 1 || (data.success !== undefined && !data.success) ) {
                reject({ error: true, message: data.messageText });
                return;
            }
            resolve(data);
        })
        .fail(reject);
}


/**
 * Функция сделает строку с инициалами из переданного ФИО
 * @param {string} fullname ФИО
 * @returns string
 */
function createIconLabel(fullname) {
    let [surname, firstname] = fullname.split(' ');
    let iconLabel = surname[0] + firstname[0];

    return iconLabel;
}


export { parseJson, getQueryParameter, isMobile, debounce, apiRequest, createIconLabel };
