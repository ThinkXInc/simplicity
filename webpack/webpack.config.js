// [DEPRECATED]
// simplicity/webpack.config.js
// NOTE: This file is for webpack. But webpack is not used now.
// All files in /src are compiled into /dist by gulp. 
// See gulpfile.js and package.json.

const path = require('path');

module.exports = [
  {
    entry: './simplicity.js',
    output: {
      filename: 'simplicity.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    mode: 'development'
  },
  {
    entry: './simplicity.js',
    output: {
      filename: 'simplicity.min.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'simplicity',
      libraryTarget: 'umd',
      libraryExport: 'default',
      globalObject: 'this'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    mode: 'production'
  }
];
