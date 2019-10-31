const ExtensionReloader = require('webpack-extension-reloader')
const config = require('./custom-webpack.config');

module.exports = {...config,
  mode: 'development',
  plugins: [new ExtensionReloader({
    reloadPage: true,
    entries: {
      background: 'background',
      "content_scripts/homecredit": "src/content_scripts/homecredit.ts",
      "content_scripts/mtsbank": 'src/content_scripts/tinkoff.ts',
      "content_scripts/openbank": 'src/content_scripts/tinkoff.ts',
      "content_scripts/otpbank": 'src/content_scripts/tinkoff.ts',
      "content_scripts/qiwi": 'src/content_scripts/tinkoff.ts',
      "content_scripts/rgsbank": 'src/content_scripts/tinkoff.ts',
      "content_scripts/sberbank": 'src/content_scripts/tinkoff.ts',
      "content_scripts/skbbank": 'src/content_scripts/tinkoff.ts',
      "content_scripts/tinkoff": 'src/content_scripts/tinkoff.ts',
      "content_scripts/vostbank": 'src/content_scripts/tinkoff.ts',
      "content_scripts/yandex": 'src/content_scripts/tinkoff.ts',
    }
  })]
}
