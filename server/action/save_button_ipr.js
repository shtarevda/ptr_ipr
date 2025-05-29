try {
    // присваиваем переменным их начальное значение
    ERROR = 0
    MESSAGE = ''
    RESULT = {}

    var eduPlanID = OptInt(plan_id, undefined)
    if (eduPlanID == undefined) {
        throw 'Не указан id плана обучения'
    }

    var path = 'x-local://wt/web/custom_projects/ipr/ipr_lib.js'
    var LIB = OpenCodeLib(path).clear()
    var bOK = LIB.sendNotifToBoss(eduPlanID)

    RESULT = {
        success: bOK
    }
} catch (error) {
    ERROR = 1
    MESSAGE = String(error.message)
    RESULT = {
        success: false
    }
}
