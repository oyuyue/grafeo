const MfesPlugin = require('@grafeo/webpack-plugin')

module.exports = {
  devServer: MfesPlugin.devServerConfig(8091),
  configureWebpack: {
    plugins: [
      new MfesPlugin({
        name: '@app/module',
        shared: {
          vue: 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.runtime.js',
          vuex: 'https://cdn.jsdelivr.net/npm/vuex@3.6.0/dist/vuex.js',
          'vue-router': 'https://cdn.jsdelivr.net/npm/vue-router@3.4.9/dist/vue-router.js',
          '@app/utils': 'http://localhost:8092/remoteEntry.js'
        }
      })
    ]
  }
}
