import React, {useRef, useEffect, useContext} from "react"

import * as TYPE from '@contexts/menu/consts.js';
import { menuContext } from '@contexts/menu/context.js'
import useFetch from '@hooks/useFetch';

export default (callback) => {
    const [context, dispatch] = useContext(menuContext);
    const [{isLoading, response, error}, doFetch] = useFetch()
    const pull = useRef([]) // делаем очередь из запросов


    /**
     * Запустить запрос к серверу
     * @param {object} fetchParams
     */
    const run = (fetchParams) => {
        if (isLoading) {
            return
        }

        doFetch(context.settings.url_to_api, fetchParams)
    }


    // по очереди выполняем каждый следующий запрос из пула запросов
    useEffect(() => {
        if (isLoading || !pull.current.length) {
            return
        }

        const param = pull.current.shift()
        doFetch(context.settings.url_to_api, param)
    }, [isLoading])


    useEffect(() => {
        if (!isLoading && response) {
            callback(response)
        }
    }, [response])


    // показать ошибки в web-интерфейсе
    useEffect(() => {
        if (error) {
            dispatch({type: TYPE.SET_ERROR, payload: error})
        }
    }, [error])

    return [run]
}
