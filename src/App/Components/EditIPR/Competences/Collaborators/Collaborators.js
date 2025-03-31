import React, { useState } from 'react'
import { DatePicker, Flex, Input } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

import Classes from './Collaborators.module.css'
import SelectWindow from '../../../../Shared/SelectWindow'

const { TextArea } = Input

function Collaborators({
    items,
    saveFieldIPR,
    parentProgpamID,
    setCompetences,
    competences,
    persons,
    can_delete
}) {
    const [collaborators, setCollaborators] = useState(persons)
    const handleDeleteCollaborator = (program_id, parent_progpam_id, tutor_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.collaborators.items = item.collaborators.items.filter(
                            (item) => item.id !== program_id
                        )
                        return item
                    }
                    return item
                })
            )
            setCollaborators(collaborators.filter((item) => item.id !== tutor_id))
        }
        const oData = {
            type: 'delete_program',
            field: 'material',
            value: program_id
        }
        saveFieldIPR(oData, callback)
    }

    const handleCollaboratorTarget = (value, program_id, parent_progpam_id) => {
        const callback = () => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parent_progpam_id) {
                        item.collaborators.items = item.collaborators.items.map(
                            (sub_item) => {
                                if (sub_item.id === program_id) {
                                    return { ...sub_item, comment: value }
                                }
                                return sub_item
                            }
                        )
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
                name: 'comment'
            },
            value: value
        }
        saveFieldIPR(oData, callback)
    }
    const collaboratorsEdit = (aPersons) => {
        const callback = (value) => {
            setCompetences(
                competences.map((item) => {
                    if (item.id === parentProgpamID) {
                        item.collaborators.items = value
                        return item
                    }
                    return item
                })
            )
        }
        const value = aPersons.length != 0 ? aPersons : []
        const oData = {
            type: 'multi_collaborators_program',
            field: {
                program_id: '',
                parent_progpam_id: parentProgpamID,
                type: 'field',
                field_type: 'material',
                name: 'tutor_id'
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
                        item.collaborators.items = item.collaborators.items.map(
                            (sub_item) => {
                                if (sub_item.id === program_id) {
                                    return { ...sub_item, plan_date: value }
                                }
                                return sub_item
                            }
                        )
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
            <SelectWindow
                placeholder="Выбрать сотрудников"
                type="button"
                multiSelect={true}
                collaborators={collaborators}
                setCollaborators={setCollaborators}
                save={collaboratorsEdit}
            />
            {items.map((item, index) => (
                <Flex
                    gap={16}
                    align="center"
                    className={Classes.collaboratorWrap}
                    key={index}>
                    <Flex vertical style={{ width: '30%' }}>
                        <div>{item.fullname}</div>
                        <div className={Classes.positionName}>
                            {item.position_name}
                        </div>
                    </Flex>

                    <div style={{ flex: 1 }}>
                        <TextArea
                            placeholder="Опишите, чем данный сотрудник будет вам полезен."
                            allowClear
                            style={{ width: '100%' }}
                            defaultValue={item.comment}
                            onBlur={(value) =>
                                handleCollaboratorTarget(
                                    value.target.value,
                                    item.id,
                                    parentProgpamID
                                )
                            }
                            onClear={(value) => {
                                handleCollaboratorTarget(
                                    value,
                                    item.id,
                                    parentProgpamID
                                )
                            }}
                        />
                    </div>
                    <div>
                        <DatePicker
                            onChange={(date, dateString) => {
                                handleSelectPlanDate(
                                    dateString,
                                    item.id,
                                    parentProgpamID
                                )
                            }}
                            format="DD.MM.YYYY"
                            variant="underlined"
                            className={Classes.datePiker}
                            value={
                                item.plan_date
                                    ? dayjs(item.plan_date, 'DD.MM.YYYY')
                                    : ''
                            }
                        />
                    </div>
                    <div>
                        {can_delete && (
                            <DeleteTwoTone
                                onClick={() => {
                                    handleDeleteCollaborator(
                                        item.id,
                                        parentProgpamID,
                                        item.tutor_id
                                    )
                                }}
                            />
                        )}
                    </div>
                </Flex>
            ))}
        </Flex>
    )
}

export default Collaborators
