import React, { useState } from 'react'
import { Flex, Space, Button, Input } from 'antd'
import { DeleteTwoTone, PlusOutlined } from '@ant-design/icons'

import Classes from './Learnings.module.css'

const FREE_TYPE_NAME = 'Саморазвитие'

function Learnings({
    items,
    saveFieldIPR,
    parentProgpamID,
    setCompetences,
    competences,
    setOpenCatalog,
    setCatalogType,
    setCurCompetenceID,
    setParentProgpamID,
    can_delete,
    comp_id
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

    // свой вариант саморазвития - задача с признаком ipr_method = self
    const handleAddFreeLearning = (parent_progpam_id) => {
        const callback = (value) => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.learnings = [
                            ...item.learnings,
                            { ...value, is_free: true, type_name: FREE_TYPE_NAME }
                        ]
                        return item
                    }
                    return item
                })
            )
        }
        const oData = {
            type: 'program',
            field: {
                program_id: '',
                parent_progpam_id: parent_progpam_id,
                type: 'custom',
                field_type: 'learning_task',
                name: 'ipr_method'
            },
            value: 'self'
        }
        saveFieldIPR(oData, callback)
    }

    const handleFreeLearningName = (value, program_id, parent_progpam_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.learnings = item.learnings.map((learning) => {
                            if (learning.id === program_id) {
                                return { ...learning, name: value }
                            }
                            return learning
                        })
                        return item
                    }
                    return item
                })
            )
        }

        const oData = {
            type: 'program',
            field: {
                program_id: program_id,
                parent_progpam_id: '',
                type: 'field',
                name: 'name'
            },
            value: value
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
                        setCurCompetenceID(comp_id)
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
                        setCurCompetenceID(comp_id)
                        setOpenCatalog(true)
                        setParentProgpamID(parentProgpamID)
                    }}>
                    <PlusOutlined />
                    Выбрать из каталога мероприятий
                </Button>
                <Button
                    type="primary"
                    className={Classes.addCalalogButton}
                    onClick={() => handleAddFreeLearning(parentProgpamID)}>
                    <PlusOutlined />
                    Добавить свой вариант
                </Button>
            </Space>

            {items.map((item) => (
                <Flex
                    gap={16}
                    align="center"
                    className={Classes.catalogWrap}
                    key={item.id}>
                    <div style={{ flex: 1 }}>
                        {item.is_free ? (
                            <Input
                                placeholder="Что планируете изучить: книга, курс, статья и т. д."
                                allowClear
                                defaultValue={item.name}
                                onBlur={(value) =>
                                    handleFreeLearningName(
                                        value.target.value,
                                        item.id,
                                        parentProgpamID
                                    )
                                }
                                onClear={() =>
                                    handleFreeLearningName(
                                        '',
                                        item.id,
                                        parentProgpamID
                                    )
                                }
                            />
                        ) : (
                            item.name
                        )}
                    </div>
                    <div style={{ width: '500px' }}>{item.type_name}</div>
                    <div>
                        {(can_delete || (item.is_free && !item.name)) && (
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
