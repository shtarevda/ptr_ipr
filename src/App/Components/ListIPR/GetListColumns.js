import React from 'react'
import { Button, Progress, Badge } from 'antd'
import getStatusColor from '../utils/getStatusColor'

import shortenText from '../../Shared/ShortenText/shortenText'
import { EditTwoTone } from '@ant-design/icons'

const safeLocaleCompare = (a, b) => {
    if (a === null || a === undefined) return -1
    if (b === null || b === undefined) return 1

    return a.localeCompare(b)
}

const GetListColumns = (changeRoute, currentRoute) => {
    if (currentRoute == 'home') {
        return [
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
                sorter: (a, b) =>
                    safeLocaleCompare(a.boss_fullname, b.boss_fullname)
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
                render: (value) => (
                    <Badge color={getStatusColor(value)} text={value} />
                )
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
    }
    if (currentRoute == 'my_persons') {
        return [
            {
                title: 'Сотрудник',
                dataIndex: 'person_fullname',
                showSorterTooltip: false,
                sorter: (a, b) =>
                    safeLocaleCompare(a.person_fullname, b.person_fullname)
            },
            {
                title: 'Процесс',
                dataIndex: 'process_name',
                showSorterTooltip: false,
                sorter: (a, b) => safeLocaleCompare(a.process_name, b.process_name)
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
                render: (value) => (
                    <Badge color={getStatusColor(value)} text={value} />
                )
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
    }
}

export default GetListColumns
