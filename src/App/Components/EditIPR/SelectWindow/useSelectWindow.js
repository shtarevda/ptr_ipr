import React, { useEffect } from 'react'
import getParamModalWindow from './getParamModalWindow'
import useFetch from '@hooks/useFetch'

export default (api) => {
    const [{ isLoading, response, error }, doFetch] = useFetch()

    const setChange = (id) => {
        console.log(id)
        //doFetch(api, { user_id: id })
    }

    useEffect(() => {
        if (!response) {
            return
        }

        if (isLoading) {
            return
        }

        console.log(response.data)
    }, [response, isLoading])

    // установка юзера
    const set = () => {
        const param = getParamModalWindow()
        param.callback = (arrId) => {
            if (arrId.length === 0) {
                return
            }
            console.log(arrId)
            const user = arrId[0]
            setChange(user.id)
        }
        const mw = new document.beeline.ModalWindow(param)
        mw.show()
    }

    return [set]
}
