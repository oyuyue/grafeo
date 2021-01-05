const MfesPlugin = require('@grafeo/webpack-plugin')

module.exports = {
  webpack(config) {
    config.plugins.push(new MfesPlugin({
      name: '@app/react',
      shared: {
        react: 'https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.development.js',
        'react-dom': 'https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.development.js'
      }
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
