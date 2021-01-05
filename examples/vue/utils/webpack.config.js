const MfesPlugin = require('@grafeo/webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/main.js',
  devtool: 'cheap-module-source-map',
  devServer: MfesPlugin.devServerConfig(8092),
  plugins: [
    new MfesPlugin({
      shared: {
        vue: 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.runtime.js',
      }
    })
  ]
}
