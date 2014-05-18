var webpack = require("webpack");

module.exports = {
  cache: true,
  entry: "./index.js",
  sourceMapFilename: "fluxbox.js.min.map",
  minimize: true,
  output: {
    path: __dirname + "/build",
    filename: "fluxbox.min.js",
    library: "Fluxbox",
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
