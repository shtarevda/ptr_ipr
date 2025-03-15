import 'core-js/es/object'
import 'core-js/es/function'
import 'core-js/es/parse-int'
import 'core-js/es/parse-float'
import 'core-js/es/number'
import 'core-js/es/math'
import 'core-js/es/string'
import 'core-js/es/date'
import 'core-js/es/regexp'
import 'core-js/es/map'
import 'core-js/es/weak-map'
import 'core-js/es/set'
import 'core-js/es/array'
import 'react-app-polyfill/ie9'
import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import 'raf/polyfill'

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '@App'
import LoadConfig from '@services/LoadConfig'

/**
 * Получить id контейнера
 * @return {string}
 */
const getCurrentScriptContainerId = () => {
    if (document.location.hostname == 'localhost') {
        return 'app_root'
    }

    if (document.currentScript !== undefined) {
        return document.currentScript.dataset.containerId
    }

    // ie
    const allScripts = document.querySelectorAll('script')
    return allScripts[allScripts.length - 1].dataset.containerId
}


// настройки по умолчанию
let app = null
let INITIAL_CONFIG = {}
const currentScriptContainerId = getCurrentScriptContainerId()

const sSelector = currentScriptContainerId
const container = document.getElementById(sSelector)
const configContainer = container.getElementsByTagName('script')

if (configContainer.length > 0 && configContainer[0].innerText !== '') {
    INITIAL_CONFIG = configContainer[0].innerText
    app = (
        <LoadConfig
            settings={INITIAL_CONFIG}
            renderContainerId={currentScriptContainerId}
        />
    )

    try {
        INITIAL_CONFIG = JSON.parse(configContainer[0].innerText)
        app = (
            <App
                settings={INITIAL_CONFIG}
                renderContainerId={currentScriptContainerId}
            />
        )
    } catch (err) {}
}

addEventListener('DOMContentLoaded', (event) => {
    const root = createRoot(container)
    root.render(app)
})
