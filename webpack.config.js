const path = require('path');

const config = {
  entry: './src/client.js',
  output: {
    path: path.resolve(__dirname, 'public', 'javascripts'),
    filename: 'bundle.js',
    publicPath: '/javascripts'
  },
  module: {
    rules: [
      {
        exclude: /(node_modules|src\/app.js)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react']
          }
        }
      }
    ]
  },
  mode: 'production'
};

module.exports = config;
