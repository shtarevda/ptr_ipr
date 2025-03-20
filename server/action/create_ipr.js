try {
    // присваиваем переменным их начальное значение
    ERROR = 0
    MESSAGE = ''
    RESULT = {}

    var userID = OptInt(curUserID, undefined)
    if (userID == undefined) {
        throw 'Не указан id пользователя! Обратитесь к администратору'
    }

    var path = 'x-local://wt/web/custom_projects/ipr/ipr_lib.js'
    var LIB = OpenCodeLib(path).clear()
    var nID = ''
    docIPR = LIB.createEduPlan(userID)
    if (docIPR != undefined) {
        nID = docIPR.DocID
    }

    RESULT = {
        id: String(nID),
        success: true
    }
} catch (error) {
    ERROR = 1
    MESSAGE = String(error.message)
    RESULT = {
        id: nID,
        success: false
    }
}
