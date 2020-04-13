'use strict';

const path = require('path');
const vars = require('./vars');

const { isEnvDevelopment, isEnvProduction, shouldUseSourceMap } = vars;

module.exports = {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    output: {
        path: path.join(__dirname, '..','app', 'dist')
    },
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: isEnvProduction
        ? shouldUseSourceMap
            ? 'source-map'
            : false
        : isEnvDevelopment && 'cheap-module-source-map',
    plugins: [],
    module: {
        rules: [
            {
                oneOf: [

                    {
                        test: /\.tsx?$/,
                        exclude: /node_modules/,
                        loader: 'ts-loader'
                    }

                ]

            }
        ]
    }
};
