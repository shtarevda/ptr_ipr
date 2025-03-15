import React, { useEffect, useContext } from "react"

import * as TYPE from '@contexts/menu/consts.js';
import { menuContext } from '@contexts/menu/context.js'
import useFetch from '@hooks/useFetch';

function load({fetchParams, type}) {
    const [{settings: {url_to_api}}, dispatch] = useContext(menuContext);
    const [{isLoading, response, error}, doFetch] = useFetch()

    useEffect(() => {
        doFetch(url_to_api, fetchParams)
    }, [])


    useEffect(() => {
        if (!isLoading && response) {
            dispatch({type, payload: response.results})
        }
    }, [response])


    // показать ошибки в web-интерфейсе
    useEffect(() => {
        if (error) {
            dispatch({type: TYPE.SET_ERROR, payload: error})
        }

    }, [error])
}

export default load
