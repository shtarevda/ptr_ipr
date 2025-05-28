import React, { useState } from 'react'
import { Flex, Space, Select, Typography, Input, Tabs, Tooltip } from 'antd'
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'

import Classes from './Competences.module.css'
import Tasks from './Tasks/Tasks'
import Collaborators from './Collaborators/Collaborators'
import Learnings from './Learnings/Learnings'

const Title = Typography.Title
const { TextArea } = Input

function Competences({
    competences,
    setCompetences,
    saveFieldIPR,
    setOpenCatalog,
    setCatalogType,
    setCurCompetenceID,
    setParentProgpamID,
    can_delete
}) {
    const handleSelectCompetence = (value, program_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === program_id) {
                        return { ...item, comp_id: value }
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
                type: 'custom_comp',
                name: 'comp_id'
            },
            value: value
        }
        saveFieldIPR(oData, callback)
    }

    const handleResult = (value, program_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === program_id) {
                        return { ...item, result: value }
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
                type: 'custom',
                name: 'ipr_result'
            },
            value: value
        }
        saveFieldIPR(oData, callback)
    }

    const handleTarget = (value, program_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === program_id) {
                        return { ...item, comment: value }
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
                name: 'comment'
            },
            value: value
        }
        saveFieldIPR(oData, callback)
    }

    const handleDeleteCompetence = (program_id) => {
        const callback = () => {
            setCompetences(competences.filter((item) => item.id !== program_id))
        }
        const oData = {
            type: 'delete_program',
            field: 'folder',
            value: program_id
        }
        saveFieldIPR(oData, callback)
    }

    return (
        <>
            {competences.map((competence, index) => (
                <Flex
                    vertical
                    gap={24}
                    className={Classes.compWrap}
                    key={competence.id}>
                    <Flex justify="space-between" align="center">
                        <Title level={4} style={{ marginBottom: 0 }}>
                            Компетенция {index + 1}
                        </Title>
                        {can_delete && (
                            <div className={Classes.trash}>
                                <DeleteOutlined
                                    onClick={() =>
                                        handleDeleteCompetence(competence.id)
                                    }
                                />
                            </div>
                        )}
                    </Flex>
                    <Space size={8}>
                        <div className={Classes.fieldLabel}>Компетенция:</div>
                        <Select
                            popupMatchSelectWidth={false}
                            placeholder="Выберите"
                            value={competence.comp_id ? competence.comp_id : null}
                            onChange={(value) => {
                                handleSelectCompetence(value, competence.id)
                            }}
                            options={[
                                {
                                    value: '7335364727859933182',
                                    label: 'Слушай и откликайся'
                                },
                                {
                                    value: '7335364727893263821',
                                    label: 'Проявляй волю'
                                },
                                {
                                    value: '7335364727923484114',
                                    label: 'Интересуйся технологиями'
                                },
                                {
                                    value: '7335364728305510084',
                                    label: 'Будь лучше себя вчерашнего'
                                },
                                {
                                    value: '7335364728312309329',
                                    label: 'Ищи возможности для улучшений'
                                },
                                {
                                    value: '7335364728682330123',
                                    label: 'Действуй осознанно'
                                },
                                {
                                    value: '7335364729076808748',
                                    label: 'Помогай и поддерживай'
                                },
                                {
                                    value: '7335364729080191987',
                                    label: 'Создавай условия и рабочую атмосферу'
                                },
                                {
                                    value: '7335364729086816643',
                                    label: 'Признавай свои ошибки. Признавай право других на ошибки'
                                }
                            ]}
                        />
                    </Space>
                    <Flex gap={8} align="center">
                        <div className={Classes.fieldLabel}>Цель развития:</div>
                        <TextArea
                            placeholder="Опишите цель кратко"
                            allowClear
                            onBlur={(value) =>
                                handleTarget(value.target.value, competence.id)
                            }
                            defaultValue={competence.comment}
                            onClear={(value) => {
                                handleTarget(value, competence.id)
                            }}
                        />
                    </Flex>

                    <Flex gap={8} align="center">
                        <div className={Classes.fieldLabel}>
                            Ожидаемый результат:
                        </div>
                        <TextArea
                            placeholder="Опишите ожидаемый результат кратко"
                            allowClear
                            onBlur={(value) =>
                                handleResult(value.target.value, competence.id)
                            }
                            defaultValue={competence.result}
                            onClear={(value) => {
                                handleResult(value, competence.id)
                            }}
                        />
                    </Flex>

                    <Flex vertical gap={16}>
                        <div className={Classes.fieldLabel}>Методы развития:</div>
                        <Tabs
                            type="card"
                            items={[
                                {
                                    key: '1',
                                    label: (
                                        <Flex justify="space-between" gap={10}>
                                            <div>
                                                Развитие на рабочем месте ~70%
                                            </div>
                                            <Tooltip title='Составление планинга с разбитием на неделю, месяц, квартал. Использование метода "Гибкое-жесткое планирование рабочего дня".'>
                                                <InfoCircleOutlined />
                                            </Tooltip>
                                        </Flex>
                                    ),
                                    children: (
                                        <div style={{ margin: '16px' }}>
                                            <Tasks
                                                items={competence.tasks}
                                                saveFieldIPR={saveFieldIPR}
                                                parentProgpamID={competence.id}
                                                setCompetences={setCompetences}
                                                competences={competences}
                                                can_delete={can_delete}
                                            />
                                        </div>
                                    )
                                },
                                {
                                    key: '2',
                                    label: (
                                        <Flex justify="space-between" gap={10}>
                                            <div>Развитие через других ~20%</div>
                                            <Tooltip title="Обмен опытом с коллегами. Обратная связь от руководителя.">
                                                <InfoCircleOutlined />
                                            </Tooltip>
                                        </Flex>
                                    ),
                                    children: (
                                        <div style={{ margin: '16px' }}>
                                            <Collaborators
                                                items={
                                                    competence.collaborators.items
                                                }
                                                persons={
                                                    competence.collaborators
                                                        .persons
                                                }
                                                saveFieldIPR={saveFieldIPR}
                                                parentProgpamID={competence.id}
                                                setCompetences={setCompetences}
                                                competences={competences}
                                                can_delete={can_delete}
                                            />
                                        </div>
                                    )
                                },
                                {
                                    key: '3',
                                    label: (
                                        <Flex justify="space-between" gap={10}>
                                            <div>Саморазвитие ~10%</div>
                                            <Tooltip title="Обучение, изучение дополнительной информаци, чтение литературы.">
                                                <InfoCircleOutlined />
                                            </Tooltip>
                                        </Flex>
                                    ),
                                    children: (
                                        <div style={{ margin: '16px' }}>
                                            <Learnings
                                                items={competence.learnings}
                                                saveFieldIPR={saveFieldIPR}
                                                parentProgpamID={competence.id}
                                                setCompetences={setCompetences}
                                                competences={competences}
                                                setOpenCatalog={setOpenCatalog}
                                                setCatalogType={setCatalogType}
                                                setCurCompetenceID={
                                                    setCurCompetenceID
                                                }
                                                setParentProgpamID={
                                                    setParentProgpamID
                                                }
                                                can_delete={can_delete}
                                                comp_id={competence.comp_id}
                                            />
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Flex>
                </Flex>
            ))}
        </>
    )
}

export default Competences
