import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Button, Flex, Select, Table, Typography, Spin, Input } from 'antd'

import Classes from './ListIPR.module.css'

import GetListColumns from './GetListColumns'
import Menu from '../Menu/Menu'

const { Search } = Input

const Title = Typography.Title

const currentYear = new Date().getFullYear()

function ListIPR({ settings, changeRoute, currentRoute }) {
    const columns = GetListColumns(changeRoute, currentRoute)

    const [listIPR, setListIPR] = useState([])
    const [filters, setFilters] = useState([])
    const [myPersonsListIPR, setMyPersonsListIPR] = useState([])
    const [myPersonsFilters, setMyPersonsFilters] = useState([])
    const [curYear, setCurYear] = useState('')
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    const filteredMyPersonsListIPR =
        search != ''
            ? myPersonsListIPR.filter(
                  (value) =>
                      String(value.person_fullname)
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                      value.person_fullname.includes(search)
              )
            : myPersonsListIPR

    let curList = currentRoute == 'home' ? listIPR : filteredMyPersonsListIPR
    let curFilter = currentRoute == 'home' ? filters : myPersonsFilters

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
        if (aResult.ipr) {
            setListIPR(aResult.ipr)
        }
        setFilters(aResult.filters)
    }

    const getMyPersonsListIPR = async () => {
        const requestBody = {
            action: 'collection',
            code: 'get_ipr_my_persons_list',
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

        if (aResult.ipr) {
            setMyPersonsListIPR(aResult.ipr)
        }
        setMyPersonsFilters(aResult.filters)
    }

    useEffect(() => {
        setLoading(true)
        getListIPR()
        getMyPersonsListIPR()
    }, [])

    const filteredListIPR =
        curYear != ''
            ? curList.filter((ipr) => ipr.start_year == curYear)
            : curList

    const assessmentIPR = curList
        ? curList.find(
              (ipr) =>
                  ipr.start_year == currentYear &&
                  ipr.process_name == 'Опрос по ценностям'
          )
        : false
    const reserveIPR = curList
        ? curList.find(
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
    const onChangeSearch = (e) => setSearch(e.target.value)
    const onSearch = (value, _e, info) => setSearch(value)

    return (
        <div>
            {myPersonsListIPR.length != 0 && (
                <Menu changeRoute={changeRoute} currentRoute={currentRoute} />
            )}
            <Title level={2}>{settings.header_title}</Title>
            <Flex justify="space-between" style={{ marginBottom: 16 }}>
                <Flex vertical gap={16}>
                    {curFilter.map((filter) => (
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
                </Flex>
                <Flex vertical gap={16} justify="center">
                    {!loading &&
                        (!assessmentIPR || !reserveIPR) &&
                        currentRoute == 'home' && (
                            <Button
                                type="primary"
                                onClick={() => {
                                    createIPR()
                                }}>
                                Добавить ИПР
                            </Button>
                        )}
                    {currentRoute != 'home' && (
                        <Flex gap={16} align="center">
                            <Search
                                size="large"
                                placeholder="Поиск по ФИО"
                                onChange={onChangeSearch}
                                onSearch={onSearch}
                                value={search}
                            />
                        </Flex>
                    )}
                </Flex>
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
                    pagination={true}></Table>
            )}
        </div>
    )
}

export default ListIPR
