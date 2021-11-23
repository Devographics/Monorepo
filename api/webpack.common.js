const path = require('path')
const nodeExternals = require('webpack-node-externals')
const WriteFilePlugin = require('write-file-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: {
        server: path.join(__dirname, 'src/server.ts'),
        standalone: path.join(__dirname, 'src/standalone.ts')
    },
    module: {
        rules: [
            {
                test: /\.yml$/,
                exclude: /node_modules/,
                use: 'js-yaml-loader'
            },
            {
                test: /\.graphql$/,
                exclude: /node_modules/,
                use: 'graphql-tag/loader'
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            }
        ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.js', '.yml', '.graphql']
    },
    externals: [nodeExternals({})],
    target: 'node',
    node: false,
    plugins: [
        new WriteFilePlugin(),
        new CopyWebpackPlugin({ patterns: [{ from: path.join(__dirname, 'public'), to: path.join(__dirname, 'dist/public') }] })
    ]
}
