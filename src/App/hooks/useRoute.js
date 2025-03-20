import { useState } from 'react'

const useRoute = () => {
    const routes = location.hash.substr(1).split('/')
    const [route, ...subRoutes] = routes
    const [currentRoute, setCurrentRoute] = useState(route === '' ? 'home' : route)
    const [curSubRoutes, setCurSubRoutes] = useState(subRoutes)

    const handleChangeRoute = (newRoute) => {
        location.hash = newRoute
        const routes = location.hash.substr(1).split('/')
        const [route, ...subRoutes] = routes

        setCurrentRoute(route === '' ? 'home' : route)
        setCurSubRoutes(subRoutes)
    }

    return { currentRoute, curSubRoutes, handleChangeRoute }
}

export default useRoute
