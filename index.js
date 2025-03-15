const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const BsSync = require('browser-sync')
const browserSync = BsSync.create()

// берем конфиги для вебпака и для запуска BrowserSync
const webpackConfig = require('./webpack.config.js')
const bundler = webpack(webpackConfig)

// куки нужны для того что бы подключиться к порталу без ввода пароля и тд
const config = require('./config.js')
const { cookieString, url } = config

// RegExp по которому BrowserSync будет подменять html
const htmlStringReplacementRegExp = /<div.*?id.*?="app_root">([\s\S]*?)<\/div>/i

const fs = require('node:fs')
const codes = fs.readFileSync('./serverSideInitialCode.js', 'utf8')
const entryPointForCodes = `
    // entry point
    try {
        return {
            "success": true,
            "data": getParam("${url}")
        }
    }
    catch(err) {
        return {
            "success": false,
            "error": String(err)
        }
    }
`

/**
 * Reload all devices when bundle is complete
 * or send a fullscreen error message to the browser instead
 */
bundler.hooks.done.tap('browserSync', function (stats) {
    if (stats.hasErrors() || stats.hasWarnings()) {
        return browserSync.sockets.emit('fullscreen:message', {
            title: 'Webpack Error:',
            body: stats.toString(),
            timeout: 100000
        })
    }
    browserSync.reload()
})

/**
 * Run Browsersync and use middleware for Hot Module Replacement
 */
browserSync.init({
    proxy: {
        target: url,
        proxyReq: [
            function (proxyReq) {
                proxyReq.setHeader('cookie', cookieString)
            }
        ]
    },
    serveStatic: ['.', `./dist/`],
    port: 8000,
    rewriteRules: [
        {
            match: htmlStringReplacementRegExp,
            fn: (req, res, match) => {
                return `
                <link rel="stylesheet" href="/index.css" />
                <script defer src="/bundle.js"
                    data-container-id="<%=curOverrideWebTemplateID%>"></script>
                <div id ="app_root"
                    data-container-id="<%=curOverrideWebTemplateID%>">
                    <script type='text'>${codes + entryPointForCodes}</script>
                <\/div>
            `
            }
        }
    ],
    plugins: ['bs-fullscreen-message'],
    logFileChanges: false,
    middleware: [
        webpackDevMiddleware(bundler, {
            publicPath: webpackConfig.output.publicPath,
            stats: {
                colors: true
            }
        }),
        webpackHotMiddleware(bundler)
    ],
    files: ['src/index.html', './src/*.css', './src/*.js']
})
