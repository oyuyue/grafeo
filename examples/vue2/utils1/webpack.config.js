const MfesPlugin = require('../../../packages/webpack-plugin/dist')

module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/main.js',
  devtool: 'cheap-module-source-map',
  devServer: MfesPlugin.devServerConfig(8092),
  plugins: [
    new MfesPlugin()
  ]
}
