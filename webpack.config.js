const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')


module.exports = {
  entry: './app/main.jsx',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, "app")
        ],
        exclude: [
          path.resolve(__dirname, "app/node_modules")
        ],
        loader: "babel-loader",
        options: {
          plugins: ["transform-react-jsx", "transform-class-properties"],
          presets: ["es2015"]
        }
      }
    ]
  },

  devServer: {
    contentBase: __dirname,
    host: '0.0.0.0',
    hot: true
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'app/template.html'
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};