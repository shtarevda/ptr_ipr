import React from 'react'
import { Tabs } from 'antd'

import ClassesGlobal from '@Components/Style.module.css'
import Classes from './Menu.module.css'

const items = [
    {
        key: 'home',
        label: 'Мой ИПР'
    },
    {
        key: 'my_persons',
        label: 'Мои сотрудники'
    },
    {
        key: 'ass_report',
        label: 'Отчет по опросу по ценностям'
    }
]

const Menu = ({ changeRoute, currentRoute }) => {
    if (items.length == 0) {
        return null
    }
    const onChange = (key) => {
        changeRoute(key)
    }

    return (
        <Tabs
            defaultActiveKey={currentRoute}
            items={items}
            style={{ marginBottom: '24px' }}
            onChange={onChange}
            size="large"
        />
    )
}

export default Menu
