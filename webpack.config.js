const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    devtool: 'eval-cheap-module-source-map',
    entry: './src/index.js',
    mode: 'development',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bundle.js',
        assetModuleFilename: 'assets/[hash][ext][query]',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node-modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['react-refresh/babel']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                auto: true,
                                localIdentName: '[name]__[local]--[hash:base64:5]'
                            }
                        }
                    }
                ]
            },
            {
                test: /\.svg/,
                type: 'asset/inline'
            },
            {
                test: /\.(png|jpe?g|webp|gif|woff2|woff|eot|ttf)$/i,
                type: 'asset/resource'
            }
        ]
    },
    watchOptions: {
        poll: 1000
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: false
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin()
    ],
    externals: {
        Chart: 'Chart',
        $: '$',
        jQuery: 'jQuery'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.css', '.scss'],
        alias: {
            '@App': path.resolve(__dirname, './src/App'),
            '@components': path.resolve(__dirname, './src/App/components_old'),
            '@Components': path.resolve(__dirname, './src/App/Components'),
            '@GroupComponents': path.resolve(
                __dirname,
                './src/App/GroupComponents'
            ),
            '@lib-components': path.resolve(
                __dirname,
                './src/App/lib-components/src/components'
            ),
            '@hooks': path.resolve(__dirname, './src/App/hooks'),
            '@contexts': path.resolve(__dirname, './src/App/contexts'),
            '@services': path.resolve(__dirname, './src/App/services'),
            Icons: path.resolve(__dirname, 'src/components/Icons'),
            Components: path.resolve(__dirname, 'src/components/'),
            Helpers: path.resolve(__dirname, 'src/services/helpers'),
            Constants: path.resolve(__dirname, 'src/services/constants'),
            '@img': path.resolve(__dirname, 'src/img')
        }
    }
}
