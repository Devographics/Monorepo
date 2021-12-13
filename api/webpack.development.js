const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const NodemonPlugin = require('nodemon-webpack-plugin')

const common = require('./webpack.common.js')

module.exports = {
    ...common,
    devtool: 'inline-source-map',
    mode: 'development',
    plugins: [...common.plugins, new CleanWebpackPlugin(), new NodemonPlugin()],
    watch: true
}
