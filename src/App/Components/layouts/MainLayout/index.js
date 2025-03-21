import React from 'react'
import ListIPR from '@Components/ListIPR/ListIPR'
import ClassesGlobal from '@Components/Style.module.css'
import EditIPR from '../../EditIPR/EditIPR'

const MainLayout = ({ settings, changeRoute, currentRoute }) => {
    return (
        <div className={ClassesGlobal.container}>
            {currentRoute == 'home' && (
                <ListIPR settings={settings} changeRoute={changeRoute} />
            )}
            {currentRoute == 'ipr_edit' && (
                <EditIPR settings={settings} changeRoute={changeRoute} />
            )}
        </div>
    )
}

export default MainLayout
