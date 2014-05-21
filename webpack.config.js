var webpack = require("webpack");

module.exports = {
  cache: true,
  entry: "./index.js",
  sourceMapFilename: "fluxxor.js.map",
  output: {
    path: __dirname + "/build",
    filename: "fluxxor.js",
    library: "Fluxxor",
    libraryTarget: "umd"
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
