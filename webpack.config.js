var path = require('path')
var webpack = require('webpack')
// var config = require('../src/config')

var viewsPath = path.resolve(__dirname, 'src/views')
var publicPath = path.resolve(__dirname, 'static')

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  // context: viewsPath,
  entry: viewsPath + '/index.js',
  output: {
    path: publicPath,
    filename: 'bundle.js'
    // filename: '[name]-[hash].js',
    // chunkFilename: '[name]-[chunkhash].js'
    // publicPath: 'http://' + config.devServer.host + ':' + config.devServer.port + '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          'babel-loader'
        ],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: function (module) {
    //     return module.context && module.context.indexOf('node_modules') !== -1
    //   }
    // })
  ]
}
