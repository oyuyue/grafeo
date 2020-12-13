const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/**@type {import('webpack').Configuration} */
module.exports = {
  mode: 'production',
  bail: true,
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    iife: true
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
}
