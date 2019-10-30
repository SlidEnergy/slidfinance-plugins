const path = require('path');

module.exports = {
  entry: {
    background: 'src/background.ts',
    "content_scripts/tinkoff": 'src/app/banks/tinkoff.ts',
    "content_scripts/homecredit": 'src/app/banks/homecredit.ts',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "content_scripts/commons",
          chunks: "initial",
          minChunks: 2,
          minSize: 0
        }
      }
    },
  }
}
