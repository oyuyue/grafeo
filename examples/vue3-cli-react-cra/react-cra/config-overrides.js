const MfesPlugin = require('../../../packages/webpack-plugin/index.js')

module.exports = {
  webpack(config) {
    config.plugins.push(new MfesPlugin({
      name: '@app/react'
    }))
    return config
  },
  devServer(cf) {
    return (proxy, allowedHost) => {
      const config = cf(proxy, allowedHost);
      Object.assign(config, MfesPlugin.devServerConfig())
      return config
    }
  }
}
