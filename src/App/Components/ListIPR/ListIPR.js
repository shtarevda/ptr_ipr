import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
    Button,
    Flex,
    Progress,
    Select,
    Table,
    Typography,
    Badge,
    Spin
} from 'antd'
import getStatusColor from '../utils/getStatusColor'

import Classes from './ListIPR.module.css'
import shortenText from '../../Shared/ShortenText/shortenText'
import { EditTwoTone } from '@ant-design/icons'

const safeLocaleCompare = (a, b) => {
    if (a === null || a === undefined) return -1
    if (b === null || b === undefined) return 1

    return a.localeCompare(b)
}

const Title = Typography.Title

const currentYear = new Date().getFullYear()

function ListIPR({ settings, changeRoute }) {
    const columns = [
        {
            title: 'Процесс',
            dataIndex: 'process_name',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.process_name, b.process_name)
        },
        {
            title: 'Руководитель',
            dataIndex: 'boss_fullname',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.boss_fullname, b.boss_fullname)
        },
        {
            title: 'Создан',
            dataIndex: 'create_date',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.create_date, b.create_date)
        },
        {
            title: 'Планируется завершить',
            dataIndex: 'plan_date',
            width: '100px',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.plan_date, b.plan_date)
        },
        {
            title: 'Завершен',
            dataIndex: 'finish_date',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.finish_date, b.finish_date)
        },
        {
            title: 'Статус',
            dataIndex: 'status_name',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.status_name, b.status_name),
            render: (value) => <Badge color={getStatusColor(value)} text={value} />
        },
        {
            title: 'Выполнение',
            dataIndex: 'readiness_percent',
            showSorterTooltip: false,
            sorter: (a, b) =>
                safeLocaleCompare(a.readiness_percent, b.readiness_percent),
            render: (value) => {
                if (value != null) {
                    return <Progress percent={value} status="active" />
                }
                return value
            }
        },
        {
            title: 'Комментарий',
            dataIndex: 'comment',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.comment, b.comment),
            render: (value) => shortenText(value)
        },
        {
            title: '',
            dataIndex: 'id',
            render: (value) => (
                <Button
                    type="link"
                    onClick={() => changeRoute('ipr_view/' + value)}>
                    <EditTwoTone />
                </Button>
            )
        }
    ]

    const [listIPR, setListIPR] = useState([])
    const [filters, setFilters] = useState([])
    const [curYear, setCurYear] = useState('')
    const [loading, setLoading] = useState(false)

    const getListIPR = async () => {
        const requestBody = {
            action: 'collection',
            code: 'get_ipr_list',
            wvars: {
                ...settings
            }
        }

        const res = await axios.post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )
        setLoading(false)
        if (!res.data.success || res.data.data.results.length == 0) return []
        const aResult = JSON.parse(res.data.data.results[0].result)
        setListIPR(aResult.ipr)
        setFilters(aResult.filters)
    }

    useEffect(() => {
        setLoading(true)
        getListIPR()
    }, [])

    const filteredListIPR =
        curYear != ''
            ? listIPR.filter((ipr) => ipr.start_year == curYear)
            : listIPR

    const assessmentIPR = listIPR
        ? listIPR.find(
              (ipr) =>
                  ipr.start_year == currentYear &&
                  ipr.process_name == 'Опрос по ценностям'
          )
        : false
    const reserveIPR = listIPR
        ? listIPR.find(
              (ipr) =>
                  ipr.start_year == currentYear &&
                  ipr.process_name == 'Кадровый резерв'
          )
        : false

    const handleSelectChange = (value) => {
        setCurYear(value)
    }

    const createIPR = async () => {
        const requestBody = {
            action: 'action',
            code: 'create_ipr',
            wvars: {
                ...settings
            }
        }

        const res = await axios.post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )

        if (!res.data.success) {
            return
        }
        const oResult = JSON.parse(res.data.data.result)
        if (!oResult.success) {
            return
        }
        //getListIPR()
        changeRoute('ipr_edit/' + oResult.id)
    }

    return (
        <div>
            <Title level={2}>{settings.header_title}</Title>
            <Flex justify="space-between" style={{ marginBottom: 16 }}>
                {filters.map((filter) => (
                    <Flex gap={16} align="center" key={filter.label}>
                        <div>{filter.title}:</div>
                        <Select
                            size="large"
                            onChange={handleSelectChange}
                            options={filter?.items?.map((item) => {
                                return { value: item, label: item }
                            })}
                            style={{ width: 400 }}
                        />
                    </Flex>
                ))}

                {!loading && (!assessmentIPR || !reserveIPR) && (
                    <Button
                        type="primary"
                        onClick={() => {
                            createIPR()
                        }}>
                        Добавить ИПР
                    </Button>
                )}
            </Flex>
            {loading ? (
                <Spin tip="Загрузка...">
                    <div style={{ padding: '50px' }}></div>
                </Spin>
            ) : (
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredListIPR}
                    pagination={false}></Table>
            )}
        </div>
    )
}

export default ListIPR
