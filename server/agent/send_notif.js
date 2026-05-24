var aSettings = [
    {
        code: 'ipr_reminder_person_90',
        type: 'person',
        days: 90,
        text: '3 месяца'
    },
    {
        code: 'ipr_reminder_person_180',
        type: 'person',
        days: 180,
        text: '6 месяцев'
    },
    {
        code: 'ipr_reminder_boss_180',
        type: 'boss',
        days: 180,
        text: '6 месяцев'
    }
]
var setting, person, sSQL, aPersons, sPersonID, oParams
for (setting in aSettings) {
    sSQL =
        " \
    SELECT ep2.id, ca.tutor_id, ca.person_id, ca.person_fullname \
    FROM education_plan ep2 \
    CROSS APPLY ( \
        SELECT  \
            TRY_CONVERT(date, ep2.data.value('(education_plan/custom_elems/custom_elem[name=''ipr_approval_date'']/value)[1]', 'varchar(50)'), 104) AS approval_date, \
            ep2.data.value('(education_plan/tutor_id)[1]', 'varchar(50)') AS tutor_id, \
            ep2.data.value('(education_plan/person_id)[1]', 'varchar(50)') AS person_id, \
            ep2.data.value('(education_plan/person_fullname)[1]', 'varchar(500)') AS person_fullname \
    ) ca \
    WHERE ca.approval_date IS NOT NULL \
    AND ca.approval_date = DATEADD(day, -" +
        setting.days +
        ', CAST(GETDATE() AS date)); \
'

    aPersons = XQuery('sql:' + sSQL)

    for (person in aPersons) {
        sPersonID = setting.type == 'person' ? person.person_id : person.tutor_id
        oParams = {}
        oParams.link = '/_wt/ipr#ipr_view/' + person.id.Value
        oParams.person_fullname = person.person_fullname.Value
        oParams.text = setting.text
        tools.create_notification(setting.code, Int(sPersonID), oParams)
    }
}
