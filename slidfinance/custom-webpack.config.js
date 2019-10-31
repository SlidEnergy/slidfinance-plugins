const path = require('path');

module.exports = {
  entry: {
    background: 'src/background.ts',
    "content_scripts/homecredit": 'src/content_scripts/homecredit.ts',
    "content_scripts/mtsbank": 'src/content_scripts/mtsbank.ts',
    "content_scripts/openbank": 'src/content_scripts/openbank.ts',
    "content_scripts/otpbank": 'src/content_scripts/otpbank.ts',
    "content_scripts/qiwi": 'src/content_scripts/qiwi.ts',
    "content_scripts/rgsbank": 'src/content_scripts/rgsbank.ts',
    "content_scripts/sberbank": 'src/content_scripts/sberbank.ts',
    "content_scripts/skbbank": 'src/content_scripts/skbbank.ts',
    "content_scripts/tinkoff": 'src/content_scripts/tinkoff.ts',
    "content_scripts/vostbank": 'src/content_scripts/vostbank.ts',
    "content_scripts/yandex": 'src/content_scripts/yandex.ts',
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
