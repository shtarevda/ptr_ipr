const packageJson = require('./package.json')

module.exports = {
    url: 'http://localhost/view_doc.html?mode=ipr_dev', //'https://webtutor.stdp.ru/view_doc.html?mode=ipr_dev',
    publicPath: packageJson.homepage,
    cookieString: 'SessionID=2265876079634168539'
}
