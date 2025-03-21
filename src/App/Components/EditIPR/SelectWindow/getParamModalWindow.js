export default (setChange) => {
    return {
        catalog: 'collaborators',
        fields: {
            code: ['тн', '9%'],
            fullname: ['ФИО', '30%'],
            position_name: ['Должность', '20%'],
            position_parent_name: ['Подразделение', '20%'],
            org_name: ['Организация', '20%']
        },
        multiselect: false,
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
