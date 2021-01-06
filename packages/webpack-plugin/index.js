const { ReplaceSource } = require('webpack-sources')

const PLUGIN_NAME = 'GrafeoWebpackPlugin'

/**
 * @constructor
 * @param {string} [opts.name] 
 * @param {string} [opts.filename]
 * @param {Object} [opts.shared]
 * @param {boolean} [opts.updateExternals]
 * @param {boolean} [opts.deleteOptimization]
 * @param {boolean} [opts.namePrefixExternal]
 */
class GrafeoWebpackPlugin {

  constructor(opts) {
    this.options = {
      filename: 'remoteEntry.js',
      updateExternals: true,
      namePrefixExternal: true,
      deleteOptimization: true,
      updateDevServer: true,
      ...opts
    }

    try {
      this.pkg = require(require('path').resolve(process.cwd(), 'package.json'))
      if (!this.options.name && this.pkg) this.options.name = this.pkg.name
    } catch {}
  }

  static devServerConfig(portOrOptions, options) {
    const devServer = {}
    if (typeof portOrOptions === 'number') {
      devServer.port = portOrOptions
    } else {
      options = Object.assign({}, portOrOptions, options)
    }
    devServer.headers = devServer.headers || {}
    devServer.headers['Access-Control-Allow-Origin'] = '*'
    devServer.disableHostCheck = true
    return Object.assign(devServer, options)
  }

  apply(compiler) {
    const { filename, shared, updateExternals, deleteOptimization, name, namePrefixExternal } = this.options

    compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
      const options = compiler.options
      options.output.filename = this.options.filename
      options.output.libraryTarget = 'system'
      delete options.output.library
      if (name) {
        options.output.jsonpFunction = `webpackJsonp${name}`
        options.output.devtoolNamespace = options.output.devtoolNamespace || name
      }
      options.module.rules.push({ parser: { system: false } })
      if (deleteOptimization && options.optimization) { 
        delete options.optimization.splitChunks
        delete options.optimization.runtimeChunk
      }

      if (options.devtool && (options.sourceMap || (options.sourceMap === 'object' && options.sourceMap.scripts === true))) delete options.devtool

      if (updateExternals) {
        const originExternals = options.externals
        const externals = Array.isArray(originExternals) ? originExternals : [originExternals]
        if (shared) externals.push(...Object.keys(shared)) 
        if (name && namePrefixExternal) {
          const scope = name.split('/')[0]
          if (scope) externals.push(new RegExp(`^${scope}\\/.+`))
        }
        options.externals = externals.filter(Boolean)
      }
    })

    if (shared) {
      const code = JSON.stringify(shared)
      compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
        compilation.hooks.optimizeChunkAssets.tap(PLUGIN_NAME, (chunks) => {
          chunks.forEach((chunk) => {
            if (chunk.files[0] === filename && chunk.isOnlyInitial()) {
              compilation.updateAsset(filename, (old) => {
                const source = new ReplaceSource(old)
                source.insert(old.source().lastIndexOf(')'), `,${code}`)
                return source
              })
            }
          })
        })
      });
    }
  }
}

module.exports = GrafeoWebpackPlugin
