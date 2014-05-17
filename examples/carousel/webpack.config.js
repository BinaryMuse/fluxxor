var webpack = require("webpack");

module.exports = {
  cache: true,
  entry: "./app/app.jsx",
  output: {
    filename: "./app/bundle.js"
  },
  devtool: "inline-source-map",
  module: {
    loaders: [
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.jsx$/, loader: "jsx-loader" }
    ]
  }
};
