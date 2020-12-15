const { ReplaceSource } = require('webpack-sources')

const pluginName = 'MfesWebpackPlugin'

/**
 * @constructor
 * @param {string} [opts.name] 
 * @param {string} [opts.filename]
 * @param {Object} [opts.shared]
 * @param {boolean} [opts.updateExternals]
 * @param {boolean} [opts.deleteSplitChunks]
 * @param {boolean} [opts.namePrefixExternal]
 */
class MfesWebpackPlugin {

  constructor(opts) {
    this.options = {
      filename: 'remoteEntry.js',
      updateExternals: true,
      namePrefixExternal: true,
      deleteSplitChunks: true,
      updateDevServer: true,
      ...opts
    }

    try {
      this.pkg = require(require('path').resolve(process.cwd(), 'package.json'));
      if (!this.options.name && this.pkg) this.options.name = this.pkg.name
    } catch {}
  }

  static devServerConfig(devServer = {}) {
    let port;
    if (typeof devServer === 'number') {
      port = devServer;
      devServer = {};
    }
    devServer.headers = devServer.headers || {}
    devServer.headers['Access-Control-Allow-Origin'] = '*'
    devServer.disableHostCheck = true
    if (port) devServer.port = port
    return devServer
  }

  apply(compiler) {
    const options = compiler.options
    const { filename, shared, updateExternals, deleteSplitChunks, name, namePrefixExternal } = this.options
    options.output = options.output || {}
    options.output.filename = this.options.filename
    options.output.libraryTarget = 'system'
    if (name) {
      options.output.jsonpFunction = `webpackJsonp_${name}`
      options.output.devtoolNamespace = options.output.devtoolNamespace || name
    }
    options.module = options.module || {}
    options.module.rules = options.module.rules || []
    options.module.rules.push({ parser: { system: false } })
    if (deleteSplitChunks && options.optimization) delete options.optimization.splitChunks

    if (updateExternals) {
      const originExternals = options.externals
      const externals = Array.isArray(originExternals) ? originExternals : [originExternals]
      if (shared) externals.push(...Object.keys(shared)) 
      if (name && namePrefixExternal) {
        const scope = name.split('/')[0]
        if (scope) externals.push(new RegExp(`^${scope}\\/.+`))
      }
      options.externals = externals.filter(x => x)
    }

    if (shared) {
      const code = JSON.stringify(shared)

      compiler.hooks.compilation.tap(pluginName, (compilation) => {
        compilation.hooks.optimizeChunkAssets.tap(pluginName, (chunks) => {
          chunks.forEach((chunk) => {
            if (chunk.files[0] === filename && chunk.isOnlyInitial()) {
              compilation.updateAsset(filename, (old) => {
                const source = new ReplaceSource(old)
                source.insert(old.source().lastIndexOf(')'), `,${code}`)
                return source;
              })
            }
          })
        })
      });
    }
  }
}

module.exports = MfesWebpackPlugin
