var webpack = require('webpack');

module.exports = {
  entry: [
    './src/scripts/Ratscrew'
  ],
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test:/\.js?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }
    ],
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
};