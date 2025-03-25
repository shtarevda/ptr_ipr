import React from 'react'
import { Button, Input } from 'antd'
import useSelectWindow from './useSelectWindow'

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
    const [set] = useSelectWindow(
        multiSelect,
        collaborators,
        setCollaborators,
        save
    )

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
