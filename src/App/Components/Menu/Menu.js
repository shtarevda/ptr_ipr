import React, { useEffect, useState } from 'react'
import { Tabs } from 'antd'

import ClassesGlobal from '@Components/Style.module.css'
import Classes from './Menu.module.css'
import loadStcData from '@services/stcData'

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

const stcItem = {
    key: 'stc',
    label: 'ИПР моего СТЦ'
}

const Menu = ({ settings, changeRoute, currentRoute, menuItems = items }) => {
    const [hasStc, setHasStc] = useState(false)

    // вкладка СТЦ видна только управляющему
    useEffect(() => {
        if (settings) {
            loadStcData(settings).then((data) => setHasStc(data.has_access))
        }
    }, [])

    if (menuItems.length == 0) {
        return null
    }
    const onChange = (key) => {
        changeRoute(key)
    }

    return (
        <Tabs
            activeKey={currentRoute}
            items={hasStc ? [...menuItems, stcItem] : menuItems}
            style={{ marginBottom: '24px' }}
            onChange={onChange}
            size="large"
        />
    )
}

export default Menu
