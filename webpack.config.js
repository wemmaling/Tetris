const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')


module.exports = {
  entry: './app/main.jsx',
  devtool: "source-map",

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
          // presets: ["es2015"]
        }
      },
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader']
      }
    ]
  },

  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)
    modules: [
      "node_modules",
      path.resolve(__dirname, "app")
    ],
    // directories where to look for modules

    extensions: [".js", ".json", ".jsx", ".css"],
    // extensions that are used
  },

  devServer: {
    contentBase: [path.resolve(__dirname, 'app/static'), __dirname],
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