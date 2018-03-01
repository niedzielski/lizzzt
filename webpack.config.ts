import * as webpack from 'webpack' // eslint-disable-line no-unused-vars
import * as CleanPlugin from 'clean-webpack-plugin'

const PRODUCTION = process.env.NODE_ENV === 'production'
const STATS = {all: false, errors: true, warnings: true}

const config: webpack.Configuration = {
  resolve: {extensions: ['.js', '.ts']},

  output: {filename: 'lizzzt.js', library: 'lizzzt'},

  performance: {maxEntrypointSize: 1024 * 300, maxAssetSize: 1024 * 300},

  module: {rules: [{test: /\.ts$/, use: 'ts-loader'}]},

  stats: STATS,

  devtool: PRODUCTION ? 'source-map' : 'eval',

  devServer: PRODUCTION
    ? undefined
    : {
        clientLogLevel: 'warning',
        progress: false,
        overlay: {warnings: true, errors: true},
        stats: STATS
      },

  plugins: [new CleanPlugin('dist', {verbose: false})]
}

export default config
