import React, { useEffect, useState } from 'react'
import useFetch from '@hooks/useFetch'
import App from '@App'

function LoadConfig({ settings, children }) {
    const [config, setConfig] = useState(null)
    const [{ isLoading, response, error }, doFetch] = useFetch()

    useEffect(() => {
        doFetch('/custom_web_template.html?object_id=7148214962165246509', {
            action: 'exec',
            codes: settings
        })
    }, [])

    useEffect(() => {
        if (!isLoading && response) {
            setConfig(response)
        }
    }, [response])

    // показать ошибки в web-интерфейсе
    useEffect(() => {
        if (error) {
            console.log('error: ', error)
        }
    }, [error])

    if (config === null) {
        return null
    }

    return <App settings={config}>{children}</App>
}

export default LoadConfig
