const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: '/node_modules'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    devServer: {
        open: true
        // contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Test AMD modules'
        })
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'boundle.js'
    }
}