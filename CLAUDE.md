# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Что это

SPA «ИПР» (индивидуальный план развития) для портала WebSoft HCM / WebTutor (Петрович). Репозиторий состоит из двух независимых частей:

- `src/` — клиент на React 18 + antd 6, собирается webpack и встраивается в страницу портала.
- `server/` + `serverSideInitialCode.js` — серверный код на SSJS (WebSoft). Он **не собирается и не запускается локально**: файлы вручную переносятся на сервер WebTutor. Для SSJS есть скилл `websoft-hcm-dev`.

## Команды

- `npm install`
- `npm run start` — dev-режим (`node .` → `index.js`): BrowserSync на `http://localhost:8000` проксирует портал из `config.js` и подмешивает бандл с HMR.
- `npm run build` — прод-сборка в `dist/` (`webpack.config.prod.js`), `publicPath` берётся из `homepage` в `package.json` (`/custom_projects/ipr/build/`).

Тестов и настроенного линтера нет. `src/prettierrc.json` prettier'ом не подхватывается (имя без точки, плагин сортировки импортов не установлен); фактический стиль кода — 4 пробела, одинарные кавычки, без точек с запятой и висячих запятых.

Перед `npm run start` в `config.js` нужно прописать `url` портала и актуальную куку `SessionID` (берётся из DevTools после авторизации на портале). Файл отслеживается git — не коммитить рабочую сессию.

## Локальный стенд

- `node deploy/deploy-local.js` — разворачивает проект на локальном стенде WebSoft (ключи `--skip-client`, `--skip-files`, `--only <код>`; клиент должен быть собран). Копирует `dist/` → `custom_projects/ipr/build/`, `server/ipr_lib.js` и `controller.js` → `custom_projects/ipr/`, затем создаёт или обновляет карточки объектов по `deploy/manifest.json`. Повторный запуск безопасен.
- Карточки создаются через ssjs-консоль (`C:\work\websoft-ssjs-console`, оттуда же берутся адрес, токен и web-root стенда). Все объекты кладутся в категорию с кодом `ptr_ipr`; категория в WebSoft — объект `role`, отдельный на каждый тип объектов.
- Коды объектов: шаблоны `ipr_controller`, `ipr` (собранный клиент), `ipr_dev` (`<div id="app_root">` для `npm run start`); элементы шаблонов `ipr` и `ipr_dev`; выборки и действия — по именам файлов; агент `ipr_send_notif`. Контроллер создаётся с id, захардкоженным в `LoadConfig.js`.
- Новую переменную, которую читает выборка или действие, нужно добавить в `wvars` объекта в манифесте — общие библиотеки передают в код только объявленные в карточке переменные.
- Собранный клиент на стенде открывать по `http://127.0.0.1/_wt/ipr`. По `http://localhost/...` он не монтируется: `src/index.js` на хосте `localhost` считает, что это dev-режим, и ищет `div#app_root`. Имя `localhost` — для `npm run start` и `mode=ipr_dev`.

## Как клиент попадает на страницу портала

Точка монтирования — `<div id="app_root">` (dev) либо div с id = `curOverrideWebTemplateID` (прод). Внутри него лежит `<script type='text'>` с конфигом, который читает `src/index.js`:

- **Прод**: `webpack.config.prod.js` вшивает `serverSideInitialCode.js` в `dist/index.html` как `<% ... %>`. Сервер выполняет его при рендере шаблона и кладёт в script готовый JSON `{success, data}` → рендерится `<App>`.
- **Dev**: `index.js` через `rewriteRules` BrowserSync заменяет `div#app_root` в проксируемой странице и кладёт в script *исходный текст* SSJS. `JSON.parse` падает, и `src/index.js` рендерит `LoadConfig`, который отправляет этот код на сервер с `action: 'exec'` (object_id контроллера там захардкожен) и получает тот же конфиг.

`getParam()` из `serverSideInitialCode.js` читает wvars элемента шаблона (`override_web_template`, в dev — с кодом `ipr_dev`) и добавляет `url_to_api`. Этот объект приходит в компоненты как `settings` (`controller_id`, `header_title`, `print_form_id` и др.) и целиком отправляется обратно в каждом запросе как `wvars`.

`src/index.js` выбирает контейнер по `location.hostname == 'localhost'`.

## Протокол клиент ↔ сервер

Все запросы — `axios.post('custom_web_template.html?object_id=' + settings.controller_id, body)`, где body:

```js
{ action: 'collection' | 'action' | 'exec', code: '<код>', wvars: { ...settings, plan_id, str_json, ... } }
```

`server/controller.js` — код custom web template; он диспетчеризует в общие портальные библиотеки `custom_projects/libs/collection_lib.js` и `remote_action_lib.js` (в репозитории их нет), а те выполняют удалённую выборку / удалённое действие с кодом `code`. Имя файла в `server/collection/` и `server/action/` = этот код. Поля `wvars` доступны в скрипте как глобальные переменные (`plan_id`, `str_json`, `person_id`, `print_form_id`), плюс `curUserID`.

Формы ответа различаются, это легко перепутать:

- collection: `res.data.data.results` — массив (скрипт пишет в `RESULT`). `get_ipr_list` / `get_ipr_my_persons_list` возвращают одну строку с JSON-строкой в поле `result` (собирается в SQL через `FOR JSON`) — её нужно `JSON.parse`.
- action: `JSON.parse(res.data.data.result)` — объект `RESULT` (обычно `{success, value}`).

Скрипты сообщают об ошибке через `ERROR` / `MESSAGE` / `RESULT`.

`server/ipr_lib.js` деплоится как `x-local://wt/web/custom_projects/ipr/ipr_lib.js` и подключается через `OpenCodeLib`; библиотека кешируется сервером (для сброса есть `clear()`). `server/agent/send_notif.js` — агент напоминаний по расписанию (90/180 дней от даты согласования).

## Модель данных

ИПР — это документ `education_plan` с `code = 'ipr'`; своих таблиц нет.

- Поля плана: `person_id` (сотрудник), `tutor_id` (руководитель), `plan_date`, `readiness_percent`, `state_id`.
- `custom_elems` плана: `ipr_status`, `ipr_type`, `ipr_approval_date`, `ipr_boss_edit`, `ipr_person_edit`.
- `programs` — плоский список, иерархия через `parent_progpam_id` (опечатка — настоящее имя поля в WebSoft, не исправлять):
  - `type == 'folder'` — компетенция (`custom_elems`: `comp_id`, `ipr_result`; `comment` = цель);
  - дочерние: `learning_task` — задача; `material` с `catalog_name == 'chat'` и `tutor_id` — «развитие через других»; `course` / `education_method` — обучение из каталога (`education_methods` с кодами `course_ipr`, `event_ipr`).

Статусы и типы процесса хранятся и сравниваются **русскими строками** сразу на клиенте и сервере: `Черновик → На согласовании → В процессе → Завершено`; процессы — `Опрос по ценностям` и `Кадровый резерв` (не более одного ИПР каждого типа в год). При переименовании править обе стороны, включая `getStatusColor.js` и SQL.

Все изменения плана идут через одно действие `edit_ipr`: клиент передаёт `str_json = {type, field, value}`, сервер ветвится по `type` (`approval`, `on_approval`, `custom`, `field`, `competence`, `delete_program`, `multi_collaborators_program`, `program`). Там же `setEdit()` выставляет флаги правок руководителя/сотрудника, от которых зависят уведомления (`approval_boss_ipr*`), а при `approval` назначаются курсы.

В серверном коде захардкожены id объектов портала: списки компетенций в `get_ipr.js`, `custom_web_template_id` отчёта в `get_view_ipr.js` / `get_ass_reports.js`, путь установки WebTutor в `download_ipr.js`.

## Клиент

- Роутинг — на хеше, без библиотеки (`hooks/useRoute.js`): `#<route>/<subRoute>`. Маршруты разбираются в `Components/layouts/MainLayout`: `home`, `my_persons`, `ipr_edit/<id>`, `ipr_view/<id>`, `ass_report`. Ссылки вида `/_wt/ipr#ipr_view/<id>` формируются и на сервере (уведомления).
- Глобального стора нет: состояние живёт в `EditIPR` / `ViewIPR` и пробрасывается пропсами вместе с `saveFieldIPR(oData, callback)` — локальное состояние обновляется в колбэке после успешного ответа сервера.
- Выбор сотрудников (`Shared/SelectWindow`) использует глобальный портальный `document.petrovich.ModalWindowSelect` — вне портала не работает.
- Тема antd (фирменные цвета) задаётся в `App.js` через `ConfigProvider`.
- Реально существующие webpack-алиасы: `@App`, `@Components`, `@hooks`, `@services`. Остальные в конфиге ведут в несуществующие папки — наследие boilerplate, как и `hooks/useApiRequest.js` и `services/load.js` (импортируют отсутствующий `@contexts`, нигде не используются).

## Серверный код: ограничения

- SSJS — это не современный JS: только `var`, без стрелочных функций, `let/const`, шаблонных строк; `for (elem in array)` перебирает элементы. Данные читаются SQL-запросами (`XQuery('sql: ...')`, MS SQL с XQuery по XML-полю `data`).
- `server/ipr_lib.js` сохранён в UTF-8 с BOM — не убирать.
- Правки в `server/` и `serverSideInitialCode.js` относятся к бэкенду: сначала показать диф и дождаться подтверждения, применяются на сервере вручную.
