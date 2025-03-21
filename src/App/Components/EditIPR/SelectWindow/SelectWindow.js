import React from 'react'
import { Button } from 'antd'
import useSelectWindow from './useSelectWindow'

function SelectWindow({ api }) {
    const [set] = useSelectWindow(api)

    return (
        <>
            <Button type="primary" onClick={set}>
                Модалка
            </Button>
        </>
    )
}

export default SelectWindow
