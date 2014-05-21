var webpack = require("webpack"),
    pkg = require("./package.json");

module.exports = {
  cache: true,
  entry: "./index.js",
  sourceMapFilename: "fluxxor.js.min.map",
  minimize: true,
  output: {
    path: __dirname + "/build",
    filename: "fluxxor.min.js",
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
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.FLUXXOR_VERSION": JSON.stringify(pkg.version)
    })
  ]
};
