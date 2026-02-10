import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Spin, Table } from 'antd'

import Menu from '@Components/Menu/Menu'
import GetListColumns from '@Components/ListIPR/GetListColumns'

function AssReport({ settings, changeRoute, currentRoute }) {
    const columns = GetListColumns(changeRoute, currentRoute)
    const [loading, setLoading] = useState(false)
    const [assReports, setAssReports] = useState([])
    const getAssReports = async () => {
        setLoading(true)
        const requestBody = {
            action: 'collection',
            code: 'get_ass_reports',
            wvars: {
                ...settings
            }
        }

        const res = await axios.post(
            'custom_web_template.html?object_id=' + String(settings.controller_id),
            requestBody
        )
        setLoading(false)

        if (!res || !res.data.data.results) return

        const result = res.data.data.results

        setAssReports(result)
        //console.log(result)
    }
    useEffect(() => {
        getAssReports()
    }, [])
    return (
        <div>
            <Menu changeRoute={changeRoute} currentRoute={currentRoute} />
            {loading ? (
                <Spin description="Загрузка...">
                    <div style={{ padding: '50px' }}></div>
                </Spin>
            ) : (
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={assReports}
                    pagination={true}></Table>
            )}
        </div>
    )
}

export default AssReport
