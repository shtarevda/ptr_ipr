import React, { useState, useEffect } from 'react'

export default () => {
    const [isLoading, setIsLoading] = useState(false)
    const [response, setResponse] = useState(null)
    const [error, setError] = useState(null)
    
    const [payload, setPayload] = useState(null)
    const [url, setUrl] = useState(null)


    const doFetch = (url = '', payload = {}) => {
        setPayload(payload)
        setUrl(url)
        setIsLoading(true)
        setError(null)
        setResponse(null)
    }


    useEffect( () => {
        if ( !isLoading ) {
            return
        } 

        getFetchData(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify(payload)
        })
        .then(res => {
            setIsLoading(false)
            setResponse(res)
        })
        .catch(err => {
            // console.log('err', err)
            setIsLoading(false)
            setError(err)
        })

    }, [isLoading])


    return [{isLoading, response, error}, doFetch]
}

 
/**
 * Функция обращения к серверу при помощи featch
 * @param {string} url
 * @param {object} options
 * @return - данные ответа
 */
const getFetchData = async (url, options) => {
    const res = await fetch(url, options)
    const resBody = await res.json()
    if (!resBody.success) {
        throw resBody.error
    }

    return resBody.data
}


/**
 * Функция обращения к серверу при помощи jQuery
 * @param {string} url
 * @param {object} options
 * @return - данные ответа
 */
const getDataWithJQuery = (url, options) => {
    return $.ajax({
        url: url,
        data: options.body,
        cache: false,
        type: options.method,
        dataType: 'JSON',
    })
}
