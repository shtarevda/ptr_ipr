const packageJson = require('./package.json')

module.exports = {
    url: 'http://localhost/view_doc.html?mode=ipr_dev', //'https://webtutor.stdp.ru/view_doc.html?mode=ipr_dev',
    publicPath: packageJson.homepage,
    cookieString: 'SessionID=1832144362554253429'
}
