const MfesPlugin = require('@grafeo/webpack-plugin')

module.exports = {
  devServer: MfesPlugin.devServerConfig(8090),
  configureWebpack: {
    plugins: [
      new MfesPlugin({
        name: '@app/shell',
        shared: {
          vue: 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.runtime.js',
          vuex: 'https://cdn.jsdelivr.net/npm/vuex@3.6.0/dist/vuex.js',
          'vue-router': 'https://cdn.jsdelivr.net/npm/vue-router@3.4.9/dist/vue-router.js',
          '@app/module': 'http://localhost:8091/remoteEntry.js',
          '@app/utils': 'http://localhost:8092/remoteEntry.js'
        }
      })
    ]
  }
}
