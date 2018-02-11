const path = require('path')
const pkg  = require('./package.json')
const webpack = require('webpack')
const CleanPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const PRODUCTION = process.env.NODE_ENV === 'production'

const STATS = {
  all: false,
  errors: true,
  errorDetails: true,
  moduleTrace: true,
  warnings: true
}

const config = {
  entry: './src',

  output: {
    path: path.resolve('build'),
    filename: 'lizzzt.js',
    library: 'lizzzt',
    libraryTarget: 'umd'
  },

  stats: STATS,

  devtool: PRODUCTION ? 'source-map' : 'cheap-module-eval-source-map',

  devServer: PRODUCTION ? undefined : {
    clientLogLevel: 'warning',
    progress: false,
    overlay: { warnings: true, errors: true },
    stats: STATS
  },

  plugins: [
    new CleanPlugin('build', { verbose: false }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(PRODUCTION ? 'production' : 'development')
      },
      VERSION: JSON.stringify(pkg.version)
    }),
  ]
}

if (PRODUCTION) {
  config.plugins.push(new UglifyJSPlugin({
    cache: true,
    parallel: true,
    sourceMap: true
  }))
}

module.exports = config