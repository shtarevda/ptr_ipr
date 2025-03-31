import React, { useState } from 'react'
import { Flex, Space, Button } from 'antd'
import { DeleteTwoTone, PlusOutlined } from '@ant-design/icons'

import Classes from './Learnings.module.css'

function Learnings({
    items,
    saveFieldIPR,
    parentProgpamID,
    setCompetences,
    competences,
    setOpenCatalog,
    setCatalogType,
    setParentProgpamID,
    can_delete
}) {
    const handleDeleteLearning = (program_id, parent_progpam_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.learnings = item.learnings.filter(
                            (item) => item.id !== program_id
                        )
                        return item
                    }
                    return item
                })
            )
        }
        const oData = {
            type: 'delete_program',
            field: 'learning',
            value: program_id
        }
        saveFieldIPR(oData, callback)
    }

    return (
        <Flex vertical gap={8}>
            <Space size={8}>
                <Button
                    type="primary"
                    className={Classes.addCalalogButton}
                    onClick={() => {
                        setCatalogType('course')
                        setOpenCatalog(true)
                        setParentProgpamID(parentProgpamID)
                    }}>
                    <PlusOutlined />
                    Выбрать из каталога курсов
                </Button>
                <Button
                    type="primary"
                    className={Classes.addCalalogButton}
                    onClick={() => {
                        setCatalogType('org')
                        setOpenCatalog(true)
                        setParentProgpamID(parentProgpamID)
                    }}>
                    <PlusOutlined />
                    Выбрать из каталога мероприятий
                </Button>
            </Space>

            {items.map((item, index) => (
                <Flex
                    gap={16}
                    align="center"
                    className={Classes.catalogWrap}
                    key={index}>
                    <div style={{ flex: 1 }}>{item.name}</div>
                    <div style={{ width: '500px' }}>{item.type_name}</div>
                    <div>
                        {can_delete && (
                            <DeleteTwoTone
                                onClick={() => {
                                    handleDeleteLearning(item.id, parentProgpamID)
                                }}
                            />
                        )}
                    </div>
                </Flex>
            ))}
        </Flex>
    )
}

export default Learnings
