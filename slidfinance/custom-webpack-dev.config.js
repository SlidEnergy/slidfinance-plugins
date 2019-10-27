const ExtensionReloader = require('webpack-extension-reloader')
const config = require('./custom-webpack.config');

module.exports = {...config,
  mode: 'development',
  plugins: [new ExtensionReloader({
    reloadPage: true,
    entries: {
      background: 'background',
      "banks/tinkoff": 'src/app/banks/tinkoff.ts',
      utils: 'src/app/banks/utils.ts',
      parser: 'src/app/banks/parser.ts'
    }
  })]
}
