const packageJson = require('./package.json')

module.exports = {
    url: 'https://webtutor.stdp.ru/view_doc.html?mode=ipr_dev',
    publicPath: packageJson.homepage,
    cookieString: 'SessionID=13140442551407231372'
}
