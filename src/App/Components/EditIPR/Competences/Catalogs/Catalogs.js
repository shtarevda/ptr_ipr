import React, { useState } from 'react'
import { Flex, Space, Button } from 'antd'
import { DeleteTwoTone, PlusOutlined } from '@ant-design/icons'

import Classes from './Catalogs.module.css'

function Catalogs() {
    const [catalogs, setCatalogs] = useState([])

    return (
        <Flex vertical gap={8}>
            <Space size={8}>
                <Button
                    type="primary"
                    className={Classes.addCalalogButton}
                    onClick={() => {}}>
                    <PlusOutlined />
                    Выбрать из каталога курсов
                </Button>
                <Button
                    type="primary"
                    className={Classes.addCalalogButton}
                    onClick={() => {}}>
                    <PlusOutlined />
                    Выбрать из каталога мероприятий
                </Button>
            </Space>

            {catalogs.map((catalog, index) => (
                <Flex
                    gap={16}
                    align="center"
                    className={Classes.catalogWrap}
                    key={index}>
                    <div>Название курса</div>
                    <div>Курс</div>
                    <div>
                        <DeleteTwoTone
                            onClick={() => {
                                setCatalogs([])
                            }}
                        />
                    </div>
                </Flex>
            ))}
        </Flex>
    )
}

export default Catalogs
