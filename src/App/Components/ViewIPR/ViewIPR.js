import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
    Breadcrumb,
    Flex,
    Typography,
    Badge,
    Input,
    Table,
    Space,
    Button,
    Spin,
    Select
} from 'antd'

import Classes from './ViewIPR.module.css'
import getStatusColor from '../utils/getStatusColor'

const Title = Typography.Title
const { TextArea } = Input

const safeLocaleCompare = (a, b) => {
    if (a === null || a === undefined) return -1
    if (b === null || b === undefined) return 1

    return a.localeCompare(b)
}

function ViewIPR({ settings, changeRoute, curSubRoutes }) {
    const [viewIPR, setViewIPR] = useState([])
    const [mainComment, setMainComment] = useState('')
    const [loading, setLoading] = useState(false)
    const getViewIPR = async () => {
        const requestBody = {
            action: 'collection',
            code: 'get_view_ipr',
            wvars: {
                ...settings,
                plan_id: curSubRoutes[0]
            }
        }

        const res = await axios.post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )
        setLoading(false)
        if (!res.data.success || res.data.data.results.length == 0) return []
        const result = res.data.data.results[0]
        setViewIPR(result)
        setMainComment(result.comment)
        //console.log(result)
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
        //console.log(aResult)
        if (afterCallback) {
            afterCallback(aResult.value)
        }
        return aResult.value
    }

    const handleSaveProgramComment = (value, program_id) => {
        const callback = () => {
            setViewIPR({
                ...viewIPR,
                programs: (viewIPR.programs = viewIPR.programs.map((task) => {
                    if (task.id == program_id) {
                        return { ...task, comment: value }
                    }
                    return task
                }))
            })
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

    const handleSendApproval = () => {
        const callback = () => {
            setViewIPR({
                ...viewIPR,
                state_id: 5,
                status: 'На согласовании'
            })
        }

        const oData = {
            type: 'on_approval'
        }
        saveFieldIPR(oData, callback)
    }

    const handleApproval = () => {
        const callback = () => {
            setViewIPR({
                ...viewIPR,
                state_id: 1,
                status: 'В процессе'
            })
        }

        const oData = {
            type: 'approval'
        }
        saveFieldIPR(oData, callback)
    }

    const handleSaveProgramIsDone = (value, program_id) => {
        const callback = (val) => {
            setViewIPR({
                ...viewIPR,
                programs: (viewIPR.programs = viewIPR.programs.map((task) => {
                    if (task.id == program_id) {
                        return { ...task, ...val }
                    }
                    return task
                }))
            })
        }

        const oData = {
            type: 'program',
            field: {
                program_id: program_id,
                parent_progpam_id: '',
                type: 'field_is_done',
                name: 'state_id'
            },
            value: value
        }
        saveFieldIPR(oData, callback)
    }
    const handleMainComment = (value) => {
        const callback = () => {
            setViewIPR({
                ...viewIPR,
                comment: value
            })
        }

        const oData = {
            type: 'field',
            field: 'comment',
            value: value
        }
        saveFieldIPR(oData, callback)
    }

    useEffect(() => {
        setLoading(true)
        getViewIPR()
    }, [])

    const columns = [
        {
            title: '№',
            dataIndex: 'index'
        },
        {
            title: 'Компетенция',
            dataIndex: 'comp_name',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.comp_name, b.comp_name)
        },
        {
            title: 'Задача',
            dataIndex: 'name',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.name, b.name)
        },
        {
            title: 'Тип задачи',
            dataIndex: 'type_name',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.type_name, b.type_name)
        },
        {
            title: 'Планируется завершить',
            dataIndex: 'plan_date',
            width: viewIPR.can_edit ? '100px' : '',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.plan_date, b.plan_date)
        },
        {
            title: 'Завершен',
            dataIndex: 'finish_date',
            hidden: !viewIPR.can_edit,
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.finish_date, b.finish_date)
        },
        {
            title: 'Комментарий',
            dataIndex: 'comment',
            showSorterTooltip: false,
            hidden: !viewIPR.can_edit,
            sorter: (a, b) => safeLocaleCompare(a.comment, b.comment),
            render: (value, record) => (
                <Input
                    disabled={!viewIPR.can_edit}
                    allowClear
                    defaultValue={value}
                    onBlur={(val) =>
                        handleSaveProgramComment(val.target.value, record.id)
                    }
                    onClear={(value) => {
                        handleSaveProgramComment(value, record.id)
                    }}
                />
            )
        },
        {
            title: 'Статус',
            dataIndex: 'program_status',
            showSorterTooltip: false,
            align: 'center',
            hidden: !viewIPR.can_edit,
            sorter: (a, b) =>
                safeLocaleCompare(
                    a.program_status.toString(),
                    b.program_status.toString()
                ),
            render: (value, record) => (
                <Select
                    disabled={!viewIPR.can_edit}
                    popupMatchSelectWidth={false}
                    placeholder="Выбрать"
                    value={value}
                    onChange={(value) => handleSaveProgramIsDone(value, record.id)}
                    options={[
                        {
                            value: 0,
                            label: 'Согласован'
                        },
                        {
                            value: 1,
                            label: 'В процессе'
                        },
                        {
                            value: 3,
                            label: 'Не пройдено'
                        },
                        {
                            value: 4,
                            label: 'Пройдено'
                        },
                        {
                            value: 6,
                            label: 'Отменено'
                        }
                    ]}
                />
            )
        }
    ]

    return (
        <>
            {loading ? (
                <Spin tip="Загрузка...">
                    <div style={{ padding: '50px' }}></div>
                </Spin>
            ) : (
                <Flex vertical gap={40}>
                    <Breadcrumb
                        separator="/"
                        items={[
                            {
                                title: 'Список ИПР',
                                href: '',
                                onClick: (e) => {
                                    e.preventDefault()
                                    changeRoute(
                                        viewIPR.cur_user_is_boss
                                            ? 'my_persons'
                                            : 'home'
                                    )
                                }
                            },
                            {
                                title: viewIPR.process
                            }
                        ]}
                    />
                    <Flex vertical gap={8}>
                        <Title level={2} style={{ marginBottom: 0 }}>
                            {viewIPR.process}
                        </Title>
                        <Badge
                            color={getStatusColor(viewIPR.status)}
                            text={viewIPR.status}
                        />
                    </Flex>
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={viewIPR.programs}
                        pagination={false}
                    />
                    <Flex vertical gap={8}>
                        <div>Комментарий:</div>
                        <TextArea
                            placeholder="Добавьте комментарий к ИПР"
                            allowClear
                            onBlur={(value) =>
                                handleMainComment(value.target.value)
                            }
                            onChange={(value) =>
                                setMainComment(value.target.value)
                            }
                            value={mainComment}
                            style={{ width: '900px', height: '160px' }}
                            onClear={(value) => {
                                handleMainComment(value)
                            }}
                        />
                    </Flex>
                    <Space size={8}>
                        {viewIPR.status == 'Черновик' && (
                            <Button
                                type="primary"
                                onClick={handleSendApproval}
                                disabled={viewIPR.programs.length == 0}>
                                Отправить на согласование
                            </Button>
                        )}
                        {viewIPR.cur_user_is_boss &&
                            viewIPR.status == 'На согласовании' && (
                                <Button type="primary" onClick={handleApproval}>
                                    Согласовать
                                </Button>
                            )}
                        <Button
                            type="default"
                            onClick={() =>
                                changeRoute('ipr_edit/' + curSubRoutes[0])
                            }>
                            Редактировать
                        </Button>
                        <Button
                            type="default"
                            onClick={() =>
                                changeRoute(
                                    viewIPR.cur_user_is_boss
                                        ? 'my_persons'
                                        : 'home'
                                )
                            }>
                            Вернуться к списку
                        </Button>
                    </Space>
                </Flex>
            )}
        </>
    )
}

export default ViewIPR
