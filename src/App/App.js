import React from 'react'
import MainLayout from './Components/layouts/MainLayout'
import useRoute from '@hooks/useRoute'
import { ConfigProvider } from 'antd'

function App({ settings }) {
    const {
        currentRoute,
        curSubRoutes,
        handleChangeRoute: changeRoute
    } = useRoute()
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#FC3',
                    colorInfo: '#FC3',
                    colorLink: '#FC3',
                    fontSize: 16,
                    sizeStep: 4,
                    sizeUnit: 4,
                    wireframe: false
                },
                components: {
                    Typography: {
                        fontSizeHeading1: 40,
                        titleMarginBottom: '40',
                        titleMarginTop: '0',
                        lineHeightHeading1: 1.3,
                        fontSizeHeading2: 32,
                        fontFamilyCode:
                            "Inter, Consolas, 'Liberation Mono', Menlo, Courier, monospace"
                    },
                    Button: {
                        contentFontSize: 18,
                        defaultBorderColor: 'transparent',
                        borderRadius: 4,
                        paddingInline: 15,
                        controlHeight: 40,
                        defaultBg: 'transparent',
                        defaultHoverBg: 'transparent',
                        defaultActiveBorderColor: 'transparent',
                        defaultHoverColor: 'transparent',
                        defaultActiveBg: 'transparent',
                        primaryShadow: '0',
                        primaryColor: '#313A4A',
                        colorPrimaryHover: '#FFBE05',
                        colorPrimaryBorder: '#FFBE05',
                        colorPrimaryActive: 'rgb(255,200,0)',
                        colorLinkHover: 'rgb(204,44,0)'
                    },
                    Layout: {
                        bodyBg: 'rgb(255,255,255)'
                    }
                }
            }}>
            <MainLayout
                settings={settings.data}
                currentRoute={currentRoute}
                changeRoute={changeRoute}
            />
        </ConfigProvider>
    )
}

export default App
