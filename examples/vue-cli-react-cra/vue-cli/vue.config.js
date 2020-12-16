const MfesPlugin = require('../../../packages/webpack-plugin/index.js')

module.exports = {
  devServer: MfesPlugin.devServerConfig(8100),
  configureWebpack: {
    plugins: [
      new MfesPlugin({
        name: '@vue2/shell',
        shared: {
          vue: 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.runtime.js',
          vuex: 'https://cdn.jsdelivr.net/npm/vuex@3.6.0/dist/vuex.js',
          'vue-router': 'https://cdn.jsdelivr.net/npm/vue-router@3.4.9/dist/vue-router.js',
          '@app/react': 'http://localhost:8101/remoteEntry.js'
        }
      })
    ]
  }
}
