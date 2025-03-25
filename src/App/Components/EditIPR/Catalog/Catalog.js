import React, { useEffect, useState } from 'react'
import { Button, Flex, Modal, Space, Typography } from 'antd'

import Classes from './Catalog.module.css'
import axios from 'axios'
import { CheckCircleOutlined } from '@ant-design/icons'

const Title = Typography.Title

function hasLearningWithEduProgramId(data, targetEduProgramId) {
    // Проходим по каждому объекту в массиве data
    for (const item of data) {
        // Проверяем, есть ли массив learnings и является ли он массивом
        if (Array.isArray(item.learnings)) {
            // Ищем элемент в массиве learnings с нужным edu_program_id
            const found = item.learnings.some(
                (learning) => learning.edu_program_id === targetEduProgramId
            )
            if (found) {
                return true // Если найден, возвращаем true
            }
        }
    }
    return false // Если ничего не найдено, возвращаем false
}

function Catalog({
    settings,
    catalogType,
    competences,
    setCompetences,
    saveFieldIPR,
    parentProgpamID
}) {
    const [learnings, setLearnings] = useState([])
    const [open, setOpen] = useState(false)
    const [detailTitle, setDetailTitle] = useState('')
    const [detailBody, setDetailBody] = useState('')
    const getLearnings = async () => {
        const requestBody = {
            action: 'collection',
            code: 'get_ipr_learnings',
            wvars: {
                ...settings
            }
        }

        const res = await axios.post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )

        if (!res.data.success || res.data.data.results.length == 0) return []
        const result = res.data.data.results
        setLearnings(result)
        console.log(result)
    }

    const handleAddLearning = (value, program_id, parent_progpam_id) => {
        const callback = (value) => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.learnings = [...item.learnings, value]
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
                parent_progpam_id: parent_progpam_id,
                type: '',
                field_type: 'education_method',
                name: ''
            },
            value: value
        }
        saveFieldIPR(oData, callback)
    }

    useEffect(() => {
        getLearnings()
    }, [])

    const catalogItems = learnings.filter((item) => item.type === catalogType)

    return (
        <Flex gap={24} wrap style={{ position: 'relative' }}>
            {catalogItems.map((learning) => (
                <div className={Classes.card} key={learning.id}>
                    <div
                        className={Classes.cover}
                        style={{
                            backgroundImage: learnings.resource_id
                                ? learnings.img
                                : 'url(/custom_projects/ipr/img/learning_cover.png)'
                        }}></div>
                    <div className={Classes.cardContent}>
                        <Flex vertical gap={16} justify="space-between">
                            <Flex vertical gap={8}>
                                <div className={Classes.cardTitle}>
                                    {learning.name}
                                </div>
                                <div className={Classes.shortDesc}>
                                    {learning.short_desc.slice(0, 150) + '...'}
                                </div>
                            </Flex>
                            <Space size={8}>
                                {hasLearningWithEduProgramId(
                                    competences,
                                    learning.id
                                ) ? (
                                    <Button
                                        type="primary"
                                        style={{ width: '150px' }}
                                        className={Classes.addedButton}
                                        disabled>
                                        <CheckCircleOutlined />
                                        Добавлено
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        style={{ width: '150px' }}
                                        onClick={() => {
                                            handleAddLearning(
                                                learning.id,
                                                '',
                                                parentProgpamID
                                            )
                                        }}>
                                        Добавить
                                    </Button>
                                )}
                                <Button
                                    type="default"
                                    style={{ width: '150px' }}
                                    onClick={() => {
                                        setDetailTitle(learning.name)
                                        setDetailBody(learning.desc)
                                        setOpen(true)
                                    }}>
                                    Подробнее
                                </Button>
                            </Space>
                        </Flex>
                    </div>
                </div>
            ))}
            <Modal
                title={
                    <Title level={3} style={{ marginBottom: 0 }}>
                        {detailTitle}
                    </Title>
                }
                open={open}
                onCancel={() => {
                    setOpen(false)
                }}
                footer={null}
                width={638}
                centered>
                <div
                    dangerouslySetInnerHTML={{
                        __html: detailBody
                    }}
                />
            </Modal>
        </Flex>
    )
}

export default Catalog
