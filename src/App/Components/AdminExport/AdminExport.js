import React, { useRef, useState } from 'react'
import axios from 'axios'
import { Button, Flex, Table, Typography, Input, Badge } from 'antd'

import Menu from '../Menu/Menu'
import getStatusColor from '../utils/getStatusColor'
import { searchAdminIPR } from '@services/adminData'

const { Search } = Input
const Title = Typography.Title

const MIN_SEARCH_LENGTH = 3

const safeLocaleCompare = (a, b) => {
    if (a === null || a === undefined) return -1
    if (b === null || b === undefined) return 1

    return a.localeCompare(b)
}

function AdminExport({ settings, changeRoute, currentRoute }) {
    const [rows, setRows] = useState(null)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [downloadingID, setDownloadingID] = useState('')
    const [error, setError] = useState('')
    const lastRequest = useRef(0)

    const handleSearch = async (value) => {
        const text = value.trim()
        if (text.length < MIN_SEARCH_LENGTH) {
            setError('Введите не меньше ' + MIN_SEARCH_LENGTH + ' символов')
            return
        }
        setError('')
        setLoading(true)
        // показываем ответ только на последний запрос
        lastRequest.current += 1
        const request = lastRequest.current
        const data = await searchAdminIPR(settings, text)
        if (request != lastRequest.current) {
            return
        }
        setLoading(false)
        setRows(data.rows)
    }

    const downloadIPR = async (row) => {
        setError('')
        setDownloadingID(row.id)
        const requestBody = {
            action: 'action',
            code: 'download_ipr',
            wvars: {
                ...settings,
                plan_id: row.id
            }
        }

        const res = await axios.post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )
        setDownloadingID('')

        const result = res.data.success ? JSON.parse(res.data.data.result) : {}
        if (!result.success) {
            setError('Не удалось сформировать файл для: ' + row.person_fullname)
            return
        }

        // в имени файла - сотрудник, процесс и год, чтобы выгрузки не путались
        const oLink = document.createElement('a')
        oLink.href = result.link
        oLink.download =
            ['ИПР', row.person_fullname, row.process_name, row.start_year]
                .filter(Boolean)
                .join(' ') + '.pdf'

        document.body.appendChild(oLink)
        oLink.click()
        document.body.removeChild(oLink)
    }

    const columns = [
        {
            title: 'Сотрудник',
            dataIndex: 'person_fullname',
            showSorterTooltip: false,
            sorter: (a, b) =>
                safeLocaleCompare(a.person_fullname, b.person_fullname),
            render: (value, record) => (
                <div>
                    {value}
                    {record.is_dismiss && (
                        <div style={{ color: '#8C8C8C' }}>уволен</div>
                    )}
                </div>
            )
        },
        {
            title: 'Должность',
            dataIndex: 'position_name'
        },
        {
            title: 'Подразделение',
            dataIndex: 'subdivision_name'
        },
        {
            title: 'Руководитель',
            dataIndex: 'boss_fullname'
        },
        {
            title: 'Процесс',
            dataIndex: 'process_name',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.process_name, b.process_name)
        },
        {
            title: 'Создан',
            dataIndex: 'create_date'
        },
        {
            title: 'Статус',
            dataIndex: 'status_name',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.status_name, b.status_name),
            render: (value) => <Badge color={getStatusColor(value)} text={value} />
        },
        {
            title: '',
            dataIndex: 'id',
            render: (value, record) => (
                <Button
                    type="default"
                    loading={downloadingID == value}
                    onClick={() => downloadIPR(record)}>
                    Скачать PDF
                </Button>
            )
        }
    ]

    return (
        <div>
            <Menu
                settings={settings}
                changeRoute={changeRoute}
                currentRoute={currentRoute}
            />
            <Title level={2}>Выгрузка ИПР сотрудников</Title>
            <Flex vertical gap={8} style={{ marginBottom: 16 }}>
                <Search
                    size="large"
                    placeholder="ФИО сотрудника или его часть"
                    allowClear
                    enterButton="Найти"
                    loading={loading}
                    onChange={(e) => setSearch(e.target.value)}
                    onSearch={handleSearch}
                    value={search}
                    style={{ width: 600 }}
                />
                {error && <div style={{ color: '#ED1C24' }}>{error}</div>}
            </Flex>
            {rows !== null && (
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={rows}
                    pagination={true}
                    locale={{ emptyText: 'ИПР не найдены' }}
                />
            )}
        </div>
    )
}

export default AdminExport
