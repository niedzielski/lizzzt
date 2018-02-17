import * as path from 'path'
import * as webpack from 'webpack'
import * as CleanPlugin from 'clean-webpack-plugin'

const pkg = require('./package.json')

const PRODUCTION = process.env.NODE_ENV === 'production'
const STATS = {all: false, errors: true, warnings: true}
const DIST_DIR = 'dist'

const config: webpack.Configuration = {
  entry: './src',
  resolve: {extensions: ['.js', '.ts']},

  output: {
    path: path.resolve(DIST_DIR),
    filename: 'lizzzt.js',
    library: 'lizzzt',
    libraryTarget: 'umd'
  },

  module: {rules: [{test: /\.ts$/, use: 'ts-loader'}]},

  stats: STATS,

  devtool: PRODUCTION ? 'source-map' : 'cheap-module-eval-source-map',

  devServer: PRODUCTION
    ? undefined
    : {
        clientLogLevel: 'warning',
        progress: false,
        overlay: {warnings: true, errors: true},
        stats: STATS
      },

  plugins: [
    new CleanPlugin(DIST_DIR, {verbose: false}),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(PRODUCTION ? 'production' : 'development')
      },
      VERSION: JSON.stringify(pkg.version)
    })
  ]
}

export default config
