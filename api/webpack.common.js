const path = require('path')
const nodeExternals = require('webpack-node-externals')
const WriteFilePlugin = require('write-file-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: {
        server: path.join(__dirname, 'src/server.ts'),
        playground: path.join(__dirname, 'src/playground.ts')
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
                // TODO: remove transpileOnly after fixing all type errors
                use: process.env.NODE_ENV === 'development' ? {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true
                    }
                } : 'ts-loader'
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
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, 'public'), to: path.resolve(__dirname, 'dist/public') }
                // { from: 'public/*', to: 'dist/public/*' }
            ]
        })
    ]
}
