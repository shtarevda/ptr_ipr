import React, { useState } from 'react'
import { Flex, Input, Button, DatePicker } from 'antd'
import { DeleteTwoTone, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

import Classes from './Tasks.module.css'

function Tasks({
    items,
    saveFieldIPR,
    parentProgpamID,
    setCompetences,
    competences,
    can_delete
}) {
    const handleAddTask = (value, program_id, parent_progpam_id) => {
        const callback = (value) => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.tasks = [...item.tasks, value]
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
                field_type: 'learning_task',
                name: ''
            },
            value: value
        }
        saveFieldIPR(oData, callback)
    }

    const handleDeleteTask = (program_id, parent_progpam_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.tasks = item.tasks.filter(
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
            field: 'learning_task',
            value: program_id
        }
        saveFieldIPR(oData, callback)
    }

    const handleTaskTarget = (value, program_id, parent_progpam_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.tasks = item.tasks.map((task) => {
                            if (task.id === program_id) {
                                return { ...task, name: value }
                            }
                            return task
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

    const handleSelectPlanDate = (value, program_id, parent_progpam_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.tasks = item.tasks.map((task) => {
                            if (task.id === program_id) {
                                return { ...task, plan_date: value }
                            }
                            return task
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
                name: 'plan_date'
            },
            value: value
        }
        saveFieldIPR(oData, callback)
    }

    return (
        <Flex vertical gap={8}>
            <Button
                type="primary"
                className={Classes.addTaskButton}
                onClick={() => {
                    handleAddTask('', '', parentProgpamID)
                }}>
                <PlusOutlined />
                Добавить задачу
            </Button>
            {items.map((task, index) => (
                <Flex
                    gap={16}
                    align="center"
                    className={Classes.taskWrap}
                    key={task.id}>
                    <div>{index + 1}</div>
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Опишите задачу"
                            allowClear
                            defaultValue={task.name}
                            onBlur={(value) =>
                                handleTaskTarget(
                                    value.target.value,
                                    task.id,
                                    parentProgpamID
                                )
                            }
                            onClear={(value) => {
                                handleTaskTarget(value, task.id, parentProgpamID)
                            }}
                        />
                    </div>
                    <div>
                        <DatePicker
                            onChange={(date, dateString) => {
                                handleSelectPlanDate(
                                    dateString,
                                    task.id,
                                    parentProgpamID
                                )
                            }}
                            format="DD.MM.YYYY"
                            variant="underlined"
                            className={Classes.datePiker}
                            value={
                                task.plan_date
                                    ? dayjs(task.plan_date, 'DD.MM.YYYY')
                                    : ''
                            }
                        />
                    </div>
                    <div>
                        {can_delete && (
                            <DeleteTwoTone
                                onClick={() => {
                                    handleDeleteTask(task.id, parentProgpamID)
                                }}
                            />
                        )}
                    </div>
                </Flex>
            ))}
        </Flex>
    )
}

export default Tasks
