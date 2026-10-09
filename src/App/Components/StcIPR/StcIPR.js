import React, { useEffect, useState } from 'react'
import {
    Button,
    Flex,
    Select,
    Table,
    Typography,
    Spin,
    Input,
    Badge,
    Progress
} from 'antd'
import { EyeTwoTone } from '@ant-design/icons'

import Menu from '../Menu/Menu'
import getStatusColor from '../utils/getStatusColor'
import loadStcData from '@services/stcData'

const { Search } = Input
const Title = Typography.Title

const NO_IPR = 'Нет ИПР'
const currentYear = String(new Date().getFullYear())

const safeLocaleCompare = (a, b) => {
    if (a === null || a === undefined) return -1
    if (b === null || b === undefined) return 1

    return a.localeCompare(b)
}

const splitCompetences = (value) =>
    value ? value.split('; ').filter((item) => item != '') : []

const getOptions = (values) =>
    [...new Set(values.filter((value) => value))]
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ value: value, label: value }))

/**
 * Собрать строки таблицы: ИПР выбранного года и сотрудники без ИПР в этом году
 * @param {object} data - сотрудники и ИПР СТЦ
 * @param {string} year - год создания ИПР, пусто - все годы
 * @return {array}
 */
const getRows = (data, year) => {
    const persons = {}
    data.persons.forEach((person) => {
        persons[person.id] = person
    })

    const withIPR = {}
    const rows = []
    data.ipr.forEach((ipr) => {
        const person = persons[ipr.person_id]
        if (!person || (year && String(ipr.start_year) != year)) {
            return
        }
        withIPR[ipr.person_id] = true
        rows.push({
            ...ipr,
            key: ipr.id,
            fullname: person.fullname,
            position_name: person.position_name,
            subdivision_name: person.subdivision_name
        })
    })

    data.persons.forEach((person) => {
        if (withIPR[person.id]) {
            return
        }
        rows.push({
            key: 'person_' + person.id,
            person_id: person.id,
            fullname: person.fullname,
            position_name: person.position_name,
            subdivision_name: person.subdivision_name,
            status_name: NO_IPR
        })
    })

    return rows
}

const exportColumns = [
    ['Сотрудник', 'fullname'],
    ['Должность', 'position_name'],
    ['Подразделение', 'subdivision_name'],
    ['Руководитель', 'boss_fullname'],
    ['Процесс', 'process_name'],
    ['Компетенции', 'competences'],
    ['Создан', 'create_date'],
    ['Планируется завершить', 'plan_date'],
    ['Завершен', 'finish_date'],
    ['Статус', 'status_name'],
    ['Выполнение, %', 'readiness_percent']
]

/**
 * Выгрузить строки в файл CSV, который открывается в Excel
 * @param {array} rows - строки таблицы
 * @param {string} name - название СТЦ
 */
const exportToExcel = (rows, name) => {
    const escape = (value) =>
        '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"'
    const lines = [exportColumns.map((column) => escape(column[0])).join(';')]
    rows.forEach((row) => {
        lines.push(exportColumns.map((column) => escape(row[column[1]])).join(';'))
    })

    // метка порядка байтов нужна, чтобы Excel прочитал файл как UTF-8
    const bom = String.fromCharCode(0xfeff)
    const lineBreak = String.fromCharCode(13, 10)
    const blob = new Blob([bom + lines.join(lineBreak)], {
        type: 'text/csv;charset=utf-8'
    })
    const oLink = document.createElement('a')
    oLink.href = URL.createObjectURL(blob)
    oLink.download = 'ИПР ' + name + '.csv'

    document.body.appendChild(oLink)
    oLink.click()
    document.body.removeChild(oLink)
    URL.revokeObjectURL(oLink.href)
}

function StcIPR({ settings, changeRoute, currentRoute }) {
    const [data, setData] = useState(null)
    const [year, setYear] = useState(currentYear)
    const [subdivision, setSubdivision] = useState('')
    const [status, setStatus] = useState('')
    const [process, setProcess] = useState('')
    const [competence, setCompetence] = useState('')
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadStcData(settings).then(setData)
    }, [])

    if (data === null) {
        return (
            <Spin description="Загрузка...">
                <div style={{ padding: '50px' }}></div>
            </Spin>
        )
    }

    const rows = getRows(data, year)
    const filteredRows = rows.filter(
        (row) =>
            (!subdivision || row.subdivision_name == subdivision) &&
            (!status || row.status_name == status) &&
            (!process || row.process_name == process) &&
            (!competence ||
                splitCompetences(row.competences).includes(competence)) &&
            (search == '' ||
                row.fullname.toLowerCase().includes(search.toLowerCase()))
    )
    const personsCount = new Set(filteredRows.map((row) => row.person_id)).size
    const iprCount = filteredRows.filter((row) => row.id).length

    const years = getOptions(
        [currentYear].concat(data.ipr.map((ipr) => String(ipr.start_year)))
    ).reverse()

    const filters = [
        ['Год', year, setYear, years],
        [
            'Подразделение',
            subdivision,
            setSubdivision,
            getOptions(data.persons.map((person) => person.subdivision_name))
        ],
        [
            'Статус',
            status,
            setStatus,
            getOptions(rows.map((row) => row.status_name))
        ],
        [
            'Процесс',
            process,
            setProcess,
            getOptions(rows.map((row) => row.process_name))
        ],
        [
            'Компетенция',
            competence,
            setCompetence,
            getOptions(
                rows.reduce(
                    (result, row) =>
                        result.concat(splitCompetences(row.competences)),
                    []
                )
            )
        ]
    ]

    const columns = [
        {
            title: 'Сотрудник',
            dataIndex: 'fullname',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.fullname, b.fullname)
        },
        {
            title: 'Должность',
            dataIndex: 'position_name',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.position_name, b.position_name)
        },
        {
            title: 'Подразделение',
            dataIndex: 'subdivision_name',
            showSorterTooltip: false,
            sorter: (a, b) =>
                safeLocaleCompare(a.subdivision_name, b.subdivision_name)
        },
        {
            title: 'Руководитель',
            dataIndex: 'boss_fullname',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.boss_fullname, b.boss_fullname)
        },
        {
            title: 'Процесс',
            dataIndex: 'process_name',
            showSorterTooltip: false,
            sorter: (a, b) => safeLocaleCompare(a.process_name, b.process_name)
        },
        {
            title: 'Компетенции',
            dataIndex: 'competences',
            render: (value) =>
                splitCompetences(value).map((item, index) => (
                    <div key={index}>{item}</div>
                ))
        },
        {
            title: 'Планируется завершить',
            dataIndex: 'plan_date',
            width: '100px'
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
            render: (value) => {
                if (value != null) {
                    return <Progress percent={value} status="active" />
                }
                return value
            }
        },
        {
            title: '',
            dataIndex: 'id',
            render: (value) =>
                value && (
                    <Button
                        type="link"
                        onClick={() => changeRoute('ipr_view/' + value)}>
                        <EyeTwoTone />
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
            <Title level={2}>{data.stc_name}</Title>
            <Flex wrap gap={16} align="center" style={{ marginBottom: 16 }}>
                {filters.map(([title, value, onChange, options]) => (
                    <Flex gap={8} align="center" key={title}>
                        <div>{title}:</div>
                        <Select
                            size="large"
                            allowClear
                            showSearch
                            placeholder="Все"
                            value={value || null}
                            onChange={(newValue) => onChange(newValue || '')}
                            options={options}
                            popupMatchSelectWidth={false}
                            style={{ width: title == 'Год' ? 110 : 240 }}
                        />
                    </Flex>
                ))}
            </Flex>
            <Flex
                justify="space-between"
                align="center"
                gap={16}
                style={{ marginBottom: 16 }}>
                <div>
                    Сотрудников: {personsCount}, ИПР: {iprCount}
                </div>
                <Flex gap={16} align="center">
                    <Search
                        size="large"
                        placeholder="Поиск по ФИО"
                        allowClear
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                        style={{ width: 300 }}
                    />
                    <Button
                        type="default"
                        onClick={() => exportToExcel(filteredRows, data.stc_name)}>
                        Выгрузить в Excel
                    </Button>
                </Flex>
            </Flex>
            <Table
                rowKey="key"
                columns={columns}
                dataSource={filteredRows}
                pagination={true}
            />
        </div>
    )
}

export default StcIPR
