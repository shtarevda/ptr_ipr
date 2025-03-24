export default (multiselect, setRecords) => {
    return {
        catalog: 'collaborators',
        fields: {
            fullname: ['ФИО', '39%'],
            position_name: ['Должность', '20%'],
            position_parent_name: ['Подразделение', '20%'],
            org_name: ['Организация', '20%']
        },
        multiselect: multiselect,
        setRecords: setRecords,
        find: [
            'id',
            'fullname',
            'code',
            'email',
            'position_name',
            'position_parent_name',
            'position_parent_id',
            'position_id',
            'org_name'
        ],
        callback: () => {}
    }
}
