var webpack = require("webpack");

module.exports = {
  cache: true,
  entry: "./app/app.jsx",
  output: {
    path: __dirname + "/app",
    filename: "bundle.js"
  },
  devtool: "source-map",
  module: {
    loaders: [
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.jsx$/, loader: "jsx-loader" },
      { test: /\.json$/, loader: "json" }
    ]
  }
};
