/**
 * Логирование
 * @param {string} value - значение для логирования
 * @param {string} name - название файла лога
 */
function addLog(value, name) {
    var sLogName = name
    if (sLogName == undefined) {
        sLogName = 'lmp_lib'
    }

    EnableLog(sLogName)
    LogEvent(sLogName, value)
}

/**
 * Получить значение по умолчанию если значение на задано
 * @param {any} value - переданное значение
 * @param {any} def - дефолтное значение
 * @return {any}
 */
function getDefaultValue(value, def) {
    if (value == undefined) {
        return def
    }

    return value
}

/**
 * Очистить кеш библиотеки
 * @return {XmElem}
 */
function clear() {
    var path = 'x-local://wt/web/custom_projects/ipr/ipr_lib.js'
    DropFormsCache(path)
    return OpenCodeLib(path)
}

/**
 * Создать план обучения
 * @param {string} userID - идентификатор пользователя
 * @return {XmElem | undefined}
 */
function createEduPlan(userID) {
    if (userID == undefined || OptInt(userID, 0) == 0) {
        addLog('Не передан ID пользователя')
        return undefined
    }
    docEduPlan = tools.new_doc_by_name('education_plan', false)
    docEduPlan.TopElem.person_id = Int(userID)
    tools.common_filling(
        'collaborator',
        docEduPlan.TopElem,
        docEduPlan.TopElem.person_id
    )
    docEduPlan.TopElem.view.part_index = 0
    docEduPlan.TopElem.code = 'ipr'
    docEduPlan.TopElem.name = 'ИПР. ' + docEduPlan.TopElem.person_fullname
    docEduPlan.BindToDb()
    docEduPlan.Save()
    return docEduPlan
}

/**
 * Удалить план обучения
 * @param {string} eduPlanID - идентификатор плана обучения
 * @return {boolean}
 */
function deleteEduPlan(eduPlanID) {
    var bOK = false
    if (eduPlanID == undefined || OptInt(eduPlanID, 0) == 0) {
        addLog('Не передан ID плана обучения')
        return false
    }
    oEduPlan = ArrayOptFirstElem(
        XQuery(
            'for $elem in education_plans where $elem/id = ' +
                eduPlanID +
                ' return $elem'
        )
    )
    if (oEduPlan != undefined) {
        bOK = true
        DeleteDoc(UrlFromDocID(oEduPlan.id))
    }
    return bOK
}

/**
 * Получить карточку плана обучения
 * @param {string} userID - ID пользователя
 * @param {boolean} bCreate - флаг для создания плана, если план не найден
 * @return {XmElem | undefined}
 */
function getEduPlan(userID, bCreate) {
    var nPersonID = OptInt(userID, undefined)
    if (nPersonID == undefined) {
        addLog('Не передан ID пользователя')
        return undefined
    }
    var docEduPlan = undefined
    var sSQL =
        " \
        SELECT \
            ep.id \
        FROM education_plans ep \
        WHERE ep.code = 'ipr' AND ep.person_id = " + nPersonID
    var oEduPlan = ArrayOptFirstElem(XQuery('sql: ' + sSQL))
    if (oEduPlan != undefined) {
        docEduPlan = tools.open_doc(oEduPlan.id)
    } else if (bCreate == true) {
        docEduPlan = createEduPlan(nPersonID)
    }

    return docEduPlan
}

/**
 * Проверка участия сотрудника в мероприятии
 * @param {string} userID - ID пользователя
 * @param {string} eduMethodIDs - строка с ID учебных программ (через с запятую)
 * @return {boolean}
 */
function checkEduMethod(userID, eduMethodIDs) {
    var sSQL =
        ' \
        SELECT \
            er.id \
        FROM events e \
        INNER JOIN event_results er ON er.event_id = e.id \
        WHERE er.person_id = ' +
        userID +
        ' AND e.education_method_id IN (' +
        eduMethodIDs +
        ')'
    var oEventResult = ArrayOptFirstElem(XQuery('sql: ' + sSQL))
    return oEventResult != undefined
}

/**
 * Установить статус плана и общий прогресс
 * @param {XmElem} docEduPlan - карточка плана обучения
 * @return {XmElem}
 */
function setEduPlanResult(docEduPlan) {
    var aFolders = ArraySelect(
        docEduPlan.TopElem.programs,
        'This.type == "folder"'
    )
    var aEduMethods = ArraySelect(
        docEduPlan.TopElem.programs,
        'This.type == "education_method"'
    )
    var nEduMethods = ArrayCount(aEduMethods)
    var nDoneEduMethods = ArrayCount(
        ArraySelect(aEduMethods, 'This.state_id == 4')
    )
    var aTasks = ArraySelect(
        docEduPlan.TopElem.programs,
        'This.type == "learning_task"'
    )
    var nTasks = ArrayCount(aTasks)
    var nDoneTasks = ArrayCount(ArraySelect(aTasks, 'This.state_id == 4'))
    for (elem in aFolders) {
        if (elem.name == 'Программы уровня') {
            if (nDoneEduMethods == nEduMethods) {
                elem.state_id = 4
            }
        }
        if (elem.name == 'Практические задания') {
            if (nDoneTasks == nTasks) {
                elem.state_id = 4
            }
        }
    }

    docEduPlan.TopElem.readiness_percent = StrReal(
        (Real(nDoneTasks + nDoneEduMethods) / Real(nEduMethods + nTasks)) * 100.0,
        0
    )

    if (docEduPlan.TopElem.readiness_percent == 100) {
        docEduPlan.TopElem.state_id = 4
        docEduPlan.TopElem.finish_date = Date()
    }

    return docEduPlan
}
