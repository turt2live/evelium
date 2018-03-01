const path = require("path");
const webpack = require("webpack");

const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

let isProd = process.env.npm_lifecycle_event === 'build';

module.exports = function () {
    const config = {};

    if (isProd) config.devtool = 'source-map';
    else config.devtool = 'eval-source-map';

    config.entry = {
        polyfills: './src/polyfills.ts',
        vendor: './src/vendor.ts',
        app: './src/main.ts',
    };

    config.output = {
        path: root('build'),
        publicPath: isProd ? '/' : '/', //http://0.0.0.0:8080',
        filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
        chunkFilename: isProd ? '[id].[hash].chunk.js' : '[id].chunk.js',
    };

    config.resolve = {
        extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html'],
    };

    config.module = {
        rules: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader', '@angularclass/hmr-loader'],
                exclude: [/node_modules\/(?!(ng2-.+))/],
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=fonts/[name].[hash].[ext]?',
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            {
                test: /\.css$/,
                exclude: root('src', 'app'),
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader'],
                }),
            },
            {
                test: /\.css$/,
                include: root('src', 'app'),
                loader: 'raw-loader!postcss-loader',
            },
            {
                test: /\.(scss|sass)$/,
                exclude: root('src', 'app'),
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'sass-loader'],
                }),
            },
            {
                test: /\.(scss|sass)$/,
                exclude: root('src', 'style'),
                loader: 'raw-loader!postcss-loader!sass-loader',
            },
            {
                test: /\.html$/, loader: 'raw-loader',
                exclude: root('src', 'public'),
            },
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader',
            }
        ]
    };

    config.plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                ENV: JSON.stringify(process.env.npm_lifecycle_event),
            },
        }),
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            root('./web') // location of your src
        ), new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: false,
                    failOnHint: false,
                },
                sassLoader: {
                    //includePaths: [path.resolve(__dirname, "node_modules/foundation-sites/scss")],
                },
            },
        }),
        new CommonsChunkPlugin({
            name: ['vendor', 'polyfills'],
        }), new HtmlWebpackPlugin({
            template: './src/public/index.html',
            chunksSortMode: 'dependency',
        }),
        new ExtractTextPlugin({filename: 'css/[name].[hash].css', disable: !isProd}),
    ];

    if (isProd) {
        config.plugins.push(
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.optimize.UglifyJsPlugin({sourceMap: true, mangle: {keep_fnames: true}}),
            new CopyWebpackPlugin([{
                from: root('src', 'public'),
            }]),
        );
    }

    config.devServer = {
        contentBase: './src/public',
        historyApiFallback: true,
        disableHostCheck: true,
        quiet: true,
        stats: 'minimal',
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:8184',
        //         secure: false
        //     }
        // },
    };

    return config;
};

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}