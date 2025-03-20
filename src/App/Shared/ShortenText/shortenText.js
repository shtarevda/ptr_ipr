import React from 'react'
import { FileTextOutlined } from '@ant-design/icons'
import { Flex, Popover } from 'antd'

function shortenText(text) {
    if (text.length > 10) {
        return (
            <Flex gap={5}>
                <span>{text.slice(0, 10) + '...'}</span>
                <Popover placement="bottom" content={text}>
                    <FileTextOutlined />
                </Popover>
            </Flex>
        )
    }
    return text
}

export default shortenText
