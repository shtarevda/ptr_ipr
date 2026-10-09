/**
 * Развернуть ИПР на локальном стенде WebSoft HCM.
 *
 *   node deploy/deploy-local.js                 # файлы + серверные объекты
 *   node deploy/deploy-local.js --skip-client   # без копирования dist/ в build/
 *   node deploy/deploy-local.js --skip-files    # только карточки объектов
 *   node deploy/deploy-local.js --only get_ipr  # один объект по коду
 *
 * Клиент должен быть собран заранее (npm run build).
 *
 * Карточки создаются через ssjs-консоль (C:\work\websoft-ssjs-console):
 * адрес, токен и web-root берутся из её config.json. Переопределение —
 * переменные окружения WS_CONSOLE_CONFIG, WS_SERVER, WS_TOKEN, WS_ENDPOINT,
 * WS_WEB_ROOT.
 *
 * Состав объектов и их категория описаны в deploy/manifest.json. Повторный
 * запуск безопасен: объект ищется по коду и обновляется.
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const args = process.argv.slice(2)
const skipClient = args.includes('--skip-client')
const skipFiles = args.includes('--skip-files')
const onlyCode = args.includes('--only') ? args[args.indexOf('--only') + 1] : ''

const stripBom = (text) => text.replace(/^\uFEFF/, '')
const readText = (file) => stripBom(fs.readFileSync(file, 'utf8'))

/**
 * Получить параметры подключения к ssjs-консоли
 * @return {object}
 */
function getConsoleConfig() {
    const file =
        process.env.WS_CONSOLE_CONFIG ||
        'C:\\work\\websoft-ssjs-console\\config.json'
    const config = fs.existsSync(file) ? JSON.parse(readText(file)) : {}

    const result = {
        server: process.env.WS_SERVER || config.server || 'http://127.0.0.1',
        endpoint:
            process.env.WS_ENDPOINT || config.endpoint || 'ssjs_console.html',
        token: process.env.WS_TOKEN || config.token,
        webRoot: process.env.WS_WEB_ROOT || config.webRoot
    }
    if (!result.token) {
        throw new Error('Нет токена ssjs-консоли: ' + file)
    }
    if (!result.webRoot) {
        throw new Error('Не задан web-root стенда (webRoot / WS_WEB_ROOT)')
    }

    return result
}

/**
 * Выполнить SSJS на стенде
 * @param {object} config - параметры подключения
 * @param {string} code - текст скрипта
 * @return {object} - { data, log }
 */
async function evalOnServer(config, code) {
    const url =
        config.server + '/' + config.endpoint + '?token=' + config.token + '&b64=1'
    const res = await fetch(url, {
        method: 'POST',
        body: Buffer.from(code, 'utf8').toString('base64')
    })
    const text = await res.text()

    let body
    try {
        body = JSON.parse(text)
    } catch (err) {
        throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 500))
    }
    if (!body.success) {
        throw new Error(body.error)
    }

    return body
}

/**
 * Скопировать файлы проекта в web-root стенда
 * @param {object} manifest
 * @param {string} webRoot
 */
function copyFiles(manifest, webRoot) {
    const projectDir = path.join(webRoot, manifest.project_dir)
    fs.mkdirSync(projectDir, { recursive: true })

    for (const item of manifest.files) {
        if (item.client && skipClient) {
            continue
        }

        const from = path.join(ROOT, item.from)
        const to = path.join(projectDir, item.to)
        if (!fs.existsSync(from)) {
            throw new Error('Не найдено: ' + from + ' (npm run build?)')
        }

        // папку зеркалим, чтобы не копились старые бандлы
        if (fs.statSync(from).isDirectory()) {
            fs.rmSync(to, { recursive: true, force: true })
        }
        fs.cpSync(from, to, { recursive: true })
        console.log('  ' + item.from + ' -> ' + to)
    }
}

async function main() {
    const config = getConsoleConfig()
    const manifest = JSON.parse(readText(path.join(__dirname, 'manifest.json')))
    const template = readText(path.join(__dirname, 'upsert.ssjs.js'))

    if (!skipFiles) {
        console.log('Файлы:')
        copyFiles(manifest, config.webRoot)
    }

    console.log('Объекты (категория ' + manifest.category.code + '):')
    for (const object of manifest.objects) {
        if (onlyCode && object.code !== onlyCode) {
            continue
        }

        const item = { ...object }
        if (item.source) {
            item.body = readText(path.join(ROOT, item.source))
            delete item.source
        }

        const payload = JSON.stringify({ category: manifest.category, item })
        const code = template.replace(
            '@@PAYLOAD_B64@@',
            Buffer.from(payload, 'utf8').toString('base64')
        )
        const { data, log } = await evalOnServer(config, code)

        for (const line of log || []) {
            console.log('  ' + line)
        }
        console.log(
            '  ' +
                (data.created ? 'создан   ' : 'обновлён ') +
                data.kind +
                ' ' +
                data.code +
                ' id=' +
                data.id
        )
    }

    for (const lib of manifest.drop_cache || []) {
        await evalOnServer(
            config,
            'DropFormsCache( ' + JSON.stringify(lib) + ' ); RESULT = true;'
        )
        console.log('Кеш сброшен: ' + lib)
    }
}

main().catch((err) => {
    console.error('ОШИБКА: ' + err.message)
    process.exit(1)
})
