import React, { useEffect, useState } from 'react'
import { Tabs } from 'antd'

import ClassesGlobal from '@Components/Style.module.css'
import Classes from './Menu.module.css'
import loadStcData from '@services/stcData'
import { loadAdminAccess } from '@services/adminData'

const items = [
    {
        key: 'home',
        label: 'Мой ИПР'
    },
    {
        key: 'my_persons',
        label: 'ИПР моих сотрудников'
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

const adminItem = {
    key: 'admin_export',
    label: 'Выгрузка ИПР'
}

const Menu = ({ settings, changeRoute, currentRoute, menuItems = items }) => {
    const [hasStc, setHasStc] = useState(false)
    const [hasAdmin, setHasAdmin] = useState(false)

    // вкладка СТЦ видна только управляющему, выгрузка - администраторам
    useEffect(() => {
        if (settings) {
            loadStcData(settings).then((data) => setHasStc(data.has_access))
            loadAdminAccess(settings).then(setHasAdmin)
        }
    }, [])

    const extraItems = []
    if (hasStc) {
        extraItems.push(stcItem)
    }
    if (hasAdmin) {
        extraItems.push(adminItem)
    }

    if (menuItems.length == 0) {
        return null
    }
    const onChange = (key) => {
        changeRoute(key)
    }

    return (
        <Tabs
            activeKey={currentRoute}
            items={[...menuItems, ...extraItems]}
            style={{ marginBottom: '24px' }}
            onChange={onChange}
            size="large"
        />
    )
}

export default Menu
