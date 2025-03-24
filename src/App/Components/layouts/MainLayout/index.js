import React, { useEffect } from 'react'
import ListIPR from '@Components/ListIPR/ListIPR'
import ClassesGlobal from '@Components/Style.module.css'
import EditIPR from '@Components/EditIPR/EditIPR'
import ViewIPR from '../../ViewIPR/ViewIPR'

const MainLayout = ({ settings, changeRoute, currentRoute, curSubRoutes }) => {
    // useEffect(() => {
    //     if (currentRoute == 'home' && window.location.hash == '') {
    //         changeRoute('')
    //     }
    //     console.log(currentRoute)
    //     console.log(window.location.hash)
    // }, [window.location.hash])
    return (
        <div className={ClassesGlobal.container}>
            {currentRoute == 'home' && (
                <ListIPR settings={settings} changeRoute={changeRoute} />
            )}
            {currentRoute == 'ipr_edit' && (
                <EditIPR
                    settings={settings}
                    changeRoute={changeRoute}
                    curSubRoutes={curSubRoutes}
                />
            )}
            {currentRoute == 'ipr_view' && (
                <ViewIPR
                    settings={settings}
                    changeRoute={changeRoute}
                    curSubRoutes={curSubRoutes}
                />
            )}
        </div>
    )
}

export default MainLayout
