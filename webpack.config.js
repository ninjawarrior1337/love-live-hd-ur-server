const path = require('path')
var nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/index.ts',
    target: 'node',
    module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: 'babel-loader',
            exclude: /node_modules/
          }
        ]
      },
    resolve: {
        extensions: ['.ts']
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist')
    },
    externals: [nodeExternals()],
}