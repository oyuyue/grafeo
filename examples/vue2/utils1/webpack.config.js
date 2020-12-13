const MfesPlugin = require('../../../packages/webpack-plugin/dist')

// 300MIUM-095
module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/main.js',
  devtool: 'cheap-module-source-map',
  devServer: MfesPlugin.devServerConfig(8092),
  plugins: [
    new MfesPlugin()
  ]
}
