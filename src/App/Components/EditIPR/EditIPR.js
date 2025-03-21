import React from 'react'
import { Breadcrumb, Typography, Flex, Space, Select, DatePicker } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import SelectWindow from './SelectWindow'

const Title = Typography.Title

const onChangeDatePicker = (date, dateString) => {
    console.log(dateString)
}

function EditIPR({ settings, changeRoute }) {
    const { api, group_id } = settings
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
            <Flex vertical gap={24}>
                <Space size={8}>
                    Процесс:{' '}
                    <Select
                        popupMatchSelectWidth={false}
                        options={[
                            { value: 'Оценка 360', label: 'Оценка 360' },
                            { value: 'Кадровый резерв', label: 'Кадровый резерв' }
                        ]}></Select>
                </Space>
                <Space size={8}>
                    Руководитель: <SelectWindow api={api} />
                </Space>
                <Space size={8}>
                    Планируется завершить:{' '}
                    <DatePicker
                        onChange={onChangeDatePicker}
                        format="DD.MM.YYYY"
                    />
                </Space>
            </Flex>
        </div>
    )
}

export default EditIPR
