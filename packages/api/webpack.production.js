const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const common = require('./webpack.common.js')

module.exports = {
    ...common,
    devtool: 'source-map',
    mode: 'production',
    plugins: [new CleanWebpackPlugin()],
}
