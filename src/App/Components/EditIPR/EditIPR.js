import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
    Button,
    Breadcrumb,
    Typography,
    Flex,
    Space,
    Select,
    DatePicker,
    Modal,
    Spin
} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import SelectWindow from '../../Shared/SelectWindow'

import Classes from './EditIPR.module.css'
import { PlusOutlined } from '@ant-design/icons'
import Competences from './Competences/Competences'

const Title = Typography.Title

function EditIPR({ settings, changeRoute, curSubRoutes }) {
    const [competences, setCompetences] = useState([])
    const [catalogType, setCatalogType] = useState('')
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false)
    const [boss, setBoss] = useState([])
    const [ipr, setIPR] = useState()

    const getIPR = async () => {
        const requestBody = {
            action: 'collection',
            code: 'get_ipr',
            wvars: {
                ...settings,
                plan_id: curSubRoutes[0]
            }
        }

        const res = await axios.post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )

        if (!res.data.success || res.data.data.results.length == 0) return []
        const result = res.data.data.results[0]
        setIPR(result)
        setBoss(result.boss)
        setCompetences(result.competences)
        console.log(result)
    }

    const deleteIPR = async () => {
        const requestBody = {
            action: 'action',
            code: 'delete_ipr',
            wvars: {
                ...settings,
                plan_id: curSubRoutes[0]
            }
        }

        const res = await axios.post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )

        if (!res.data.success) {
            return
        }
        changeRoute('')
    }

    const saveFieldIPR = async (oData, afterCallback) => {
        const requestBody = {
            action: 'action',
            code: 'edit_ipr',
            wvars: {
                ...settings,
                plan_id: curSubRoutes[0],
                str_json: JSON.stringify(oData)
            }
        }

        const res = await axios.post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )

        if (!res.data.success) {
            return
        }

        const aResult = JSON.parse(res.data.data.result)
        if (!aResult.success) {
            return
        }
        console.log(aResult)
        if (afterCallback) {
            afterCallback(aResult.value)
        }
        return aResult.value
    }

    const showConfirmDeleteModal = () => {
        setOpenConfirmDelete(true)
    }

    const hideConfirmDeleteModal = () => {
        setOpenConfirmDelete(false)
    }

    const handleDeleteIPR = () => {
        setOpenConfirmDelete(false)
        deleteIPR()
    }

    const handleAddCompetence = () => {
        const callback = (value) => {
            setCompetences([...competences, value])
        }
        const oData = {
            type: 'competence',
            field: 'folder',
            value: ''
        }
        saveFieldIPR(oData, callback)
    }

    const handleSelectProcess = (value) => {
        const callback = () => {
            setIPR({ ...ipr, process: value })
        }
        const oData = {
            type: 'custom',
            field: 'ipr_type',
            value: value
        }
        saveFieldIPR(oData, callback)
    }

    const handleSelectPlanDate = (value) => {
        const callback = () => {
            setIPR({ ...ipr, plan_date: value })
        }

        const oData = {
            type: 'field',
            field: 'plan_date',
            value: value
        }
        saveFieldIPR(oData, callback)
    }

    const tutorEdit = (aPersons) => {
        const value = aPersons.length != 0 ? aPersons[0].id : ''
        const oData = {
            type: 'field',
            field: 'tutor_id',
            value: value
        }
        saveFieldIPR(oData)
    }

    useEffect(() => {
        getIPR()
    }, [])

    return (
        <div>
            <Flex vertical gap={24}>
                <Breadcrumb
                    separator="/"
                    items={[
                        {
                            title: 'Список ИПР',
                            href: '',
                            onClick: (e) => {
                                e.preventDefault()
                                changeRoute('')
                            }
                        },
                        {
                            title: 'План развития'
                        }
                    ]}
                />
                <Title level={2}>План развития</Title>
            </Flex>
            {ipr ? (
                <Flex vertical gap={24}>
                    <Space size={8}>
                        <div className={Classes.fieldLabel}>Процесс:</div>
                        <Select
                            popupMatchSelectWidth={false}
                            placeholder="Выберите"
                            value={ipr.process}
                            onChange={(value) => {
                                handleSelectProcess(value)
                            }}
                            options={[
                                { value: 'Оценка 360', label: 'Оценка 360' },
                                {
                                    value: 'Кадровый резерв',
                                    label: 'Кадровый резерв'
                                }
                            ]}></Select>
                    </Space>
                    <Space size={8}>
                        <div className={Classes.fieldLabel}>Руководитель:</div>
                        <SelectWindow
                            placeholder="Выберите руководителя"
                            multiSelect={false}
                            save={tutorEdit}
                            collaborators={boss}
                            setCollaborators={setBoss}
                        />
                    </Space>
                    <Space size={8}>
                        <div className={Classes.fieldLabel}>
                            Планируется завершить:
                        </div>
                        <DatePicker
                            onChange={(date, dateString) => {
                                handleSelectPlanDate(dateString)
                            }}
                            format="DD.MM.YYYY"
                            value={
                                ipr.plan_date
                                    ? dayjs(ipr.plan_date, 'DD.MM.YYYY')
                                    : ''
                            }
                        />
                    </Space>

                    <Competences
                        competences={competences}
                        setCompetences={setCompetences}
                        saveFieldIPR={saveFieldIPR}
                    />

                    <Button
                        type="text"
                        className={Classes.addCompButton}
                        onClick={handleAddCompetence}>
                        <PlusOutlined />
                        Добавить компетенцию
                    </Button>
                    <Space size={8}>
                        <Button type="primary">Сохранить</Button>
                        <Button type="default" onClick={showConfirmDeleteModal}>
                            Удалить ИПР
                        </Button>
                        <Modal
                            title="Подтвердите действие"
                            open={openConfirmDelete}
                            onOk={handleDeleteIPR}
                            onCancel={hideConfirmDeleteModal}
                            okText="Удалить ИПР"
                            cancelText="Отмена">
                            <p>Вы действительно хотите удалить ИПР?</p>
                        </Modal>
                    </Space>
                </Flex>
            ) : (
                <Spin tip="Загрузка...">
                    <div style={{ padding: '50px' }}></div>
                </Spin>
            )}
        </div>
    )
}

export default EditIPR
