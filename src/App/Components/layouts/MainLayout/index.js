import React from 'react'
import ListIPR from '@Components/ListIPR/ListIPR'
import ClassesGlobal from '@Components/Style.module.css'

const MainLayout = ({ settings, changeRoute, currentRoute }) => {
    return (
        <div className={ClassesGlobal.container}>
            {currentRoute == 'home' && (
                <ListIPR settings={settings} changeRoute={changeRoute} />
            )}
        </div>
    )
}

export default MainLayout
