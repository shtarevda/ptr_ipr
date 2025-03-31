import React from 'react'
import { Button, Input } from 'antd'

import getParamModalWindow from './getParamModalWindow'

import Classes from './SelectWindow.module.css'
import { PlusOutlined } from '@ant-design/icons'

function SelectWindow({
    placeholder,
    multiSelect,
    type = 'input',
    collaborators,
    setCollaborators,
    save
}) {
    const set = () => {
        const param = getParamModalWindow()
        param.callback = (arrId) => {
            if (save) save(arrId)
            if (setCollaborators) setCollaborators(arrId)
        }
        param.setRecords = () => {
            return collaborators
        }
        param.multiselect = multiSelect
        const mw = new document.petrovich.ModalWindowSelect(param)
        mw.show()
    }

    return (
        <>
            {type == 'input' && (
                <Input
                    defaultValue=""
                    value={collaborators.map((item) => item.fullname).join(', ')}
                    placeholder={placeholder}
                    style={{ width: '300px' }}
                    size="middle"
                    allowClear
                    onClick={set}
                    onClear={() => {
                        setCollaborators([])
                        save([])
                    }}
                />
            )}
            {type == 'button' && (
                <Button type="primary" onClick={set} className={Classes.addButton}>
                    <PlusOutlined />
                    {placeholder}
                </Button>
            )}
        </>
    )
}

export default SelectWindow
