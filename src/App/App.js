import React from 'react'
import MainLayout from './Components/layouts/MainLayout'
import useRoute from '@hooks/useRoute'
import { ConfigProvider } from 'antd'
import ru_RU from 'antd/locale/ru_RU'
import Menu from './Components/Menu/Menu'

function App({ settings }) {
    const {
        currentRoute,
        curSubRoutes,
        handleChangeRoute: changeRoute
    } = useRoute()
    return (
        <ConfigProvider
            locale={ru_RU}
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
                        titleMarginBottom: '40px',
                        titleMarginTop: '0',
                        lineHeightHeading1: 1.3,
                        fontSizeHeading2: 32,
                        fontFamilyCode:
                            "Inter, Consolas, 'Liberation Mono', Menlo, Courier, monospace"
                    },
                    Button: {
                        contentFontSize: 16,
                        borderRadius: 2,
                        paddingInline: 15,
                        controlHeight: 40,
                        defaultBg: 'transparent',
                        defaultHoverBg: 'rgba(255, 204, 51, 0.20)',
                        defaultActiveBorderColor: 'rgb(255,200,0)',
                        defaultActiveBg: 'transparent',
                        defaultActiveColor: '#313A4A',
                        defaultBorderColor: 'rgb(255,200,0)',
                        defaultHoverColor: '#313A4A',
                        defaultHoverBorderColor: 'rgb(255,200,0)',
                        primaryShadow: '0',
                        primaryColor: '#313A4A',
                        primaryHoverBorderColor: 'transparent',
                        colorPrimaryHover: '#FFBE05',
                        colorPrimaryBorder: '#FFBE05',
                        colorPrimaryActive: 'rgb(255,200,0)',
                        colorLinkHover: 'rgb(204,44,0)',
                        textHoverBg: 'rgba(0,0,0,0)',
                        textTextColor: '#313A4A',
                        textTextHoverColor: '#ed1c25',
                        colorBgTextActive: 'rgba(255,255,255,0)',
                        textTextActiveColor: 'rgb(255,200,0)'
                    },
                    Tabs: {
                        itemSelectedColor: 'rgb(204,44,0)',
                        itemHoverColor: '#313A4A',
                        itemActiveColor: '#313A4A',
                        cardBg: '#FAFAFA',
                        borderRadiusLG: 2,
                        margin: 0,
                        colorBorderSecondary: 'rgb(255,255,255)',
                        cardGutter: 4,
                        colorBorderSecondary: '#F0F0F0'
                    },
                    Layout: {
                        bodyBg: 'rgb(255,255,255)'
                    },
                    Input: {
                        borderRadius: 2
                    },
                    Select: {
                        borderRadius: 2
                    },
                    DatePicker: {
                        borderRadius: 2
                    }
                }
            }}>
            <MainLayout
                settings={settings.data}
                currentRoute={currentRoute}
                changeRoute={changeRoute}
                curSubRoutes={curSubRoutes}
            />
        </ConfigProvider>
    )
}

export default App
