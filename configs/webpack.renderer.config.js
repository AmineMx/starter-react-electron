const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const baseConfig = require('./webpack.base.config');
// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const vars = require('./vars');

const { isEnvDevelopment, isEnvProduction, shouldUseSourceMap } = vars;

/*console.log(vars);
process.exit()*/
const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
        isEnvDevelopment && require.resolve('style-loader'),
        isEnvProduction && {
            loader: MiniCssExtractPlugin.loader

        },
        {
            loader: require.resolve('css-loader'),
            options: cssOptions
        }
    ].filter(Boolean);

    if (preProcessor) {
        loaders.push(
            {
                loader: require.resolve('resolve-url-loader'),
                options: {
                    sourceMap: isEnvProduction && shouldUseSourceMap
                }
            },
            {
                loader: require.resolve(preProcessor),
                options: {
                    sourceMap: true
                }
            }
        );
    }
    return loaders;
};
const path = require('path');
module.exports = merge.smart(baseConfig, {
    target: 'electron-preload',
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    entry: [
        isEnvDevelopment &&
        require.resolve('react-dev-utils/webpackHotDevClient'),
        './app/src/renderer/index.tsx'
    ].filter(Boolean),
    optimization: {
        namedModules: true
    },
    output: {
        // publicPath: 'dist',
        filename: isEnvProduction
            ? 'renderer.prod.js'
            : isEnvDevelopment && 'renderer.bundle.js',
        devtoolModuleFilenameTemplate: isEnvProduction
            ? info =>
                path
                    .relative('./app/renderer', info.absoluteResourcePath)
                    .replace(/\\/g, '/')
            : isEnvDevelopment &&
            (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
        jsonpFunction: `webpackJsonp-render`,

        globalObject: 'this'
    },
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                        use: {
                            loader: 'url-loader',
                            options: {
                                limit: 1,
                                name: 'media/[hash:10].[ext]'
                            }
                        }

                    },
                    {
                        test: /\.tsx?$/,
                        exclude: /node_modules/,
                        loader: 'ts-loader'
                    },

                    {
                        test: cssRegex,
                        exclude: cssModuleRegex,
                        use: getStyleLoaders({
                            importLoaders: 1,
                            sourceMap: isEnvProduction && shouldUseSourceMap
                        }),
                        // Don't consider CSS imports dead code even if the
                        // containing package claims to have no side effects.
                        // Remove this when webpack adds a warning or an error for this.
                        // See https://github.com/webpack/webpack/issues/6571
                        sideEffects: true
                    },
                    // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
                    // using the extension .module.css
                    {
                        test: cssModuleRegex,
                        use: getStyleLoaders({
                            importLoaders: 1,
                            sourceMap: isEnvProduction && shouldUseSourceMap
                        })
                    },
                    // Opt-in support for SASS (using .scss or .sass extensions).
                    // By default we support SASS Modules with the
                    // extensions .module.scss or .module.sass
                    {
                        test: sassRegex,
                        exclude: sassModuleRegex,
                        use: getStyleLoaders(
                            {
                                importLoaders: 3,
                                sourceMap: isEnvProduction && shouldUseSourceMap
                            },
                            'sass-loader'
                        ),
                        // Don't consider CSS imports dead code even if the
                        // containing package claims to have no side effects.
                        // Remove this when webpack adds a warning or an error for this.
                        // See https://github.com/webpack/webpack/issues/6571
                        sideEffects: true
                    },
                    // Adds support for CSS Modules, but using SASS
                    // using the extension .module.scss or .module.sass
                    {
                        test: sassModuleRegex,
                        use: getStyleLoaders(
                            {
                                importLoaders: 3,
                                sourceMap: isEnvProduction && shouldUseSourceMap

                            },
                            'sass-loader'
                        )
                    },

                    {

                        loader: require.resolve('file-loader'),
                        // Exclude `js` files to keep "css" loader working as it injects
                        // its runtime that would otherwise be processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'media/[hash:8].[ext]'
                        }
                    }
                ]

            }
        ]
    },
    plugins: [
        isEnvProduction && new MiniCssExtractPlugin({
            filename: 'style.css'
        }),
        // This is necessary to emit hot updates (currently CSS only):
        isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin(Object.assign(
            {},
            {
                inject: true,
                template: 'app/src/renderer/index.html'
            },
            isEnvProduction
                ? {
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        keepClosingSlash: true,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyURLs: true
                    }
                }
                : undefined
        )),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ].filter(Boolean)
});
