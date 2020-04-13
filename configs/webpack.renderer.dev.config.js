const path = require('path');

const merge = require('webpack-merge');
const spawn = require('child_process').spawn;

const baseConfig = require('./webpack.renderer.config');
const port = process.env.PORT || 9000;
const publicPath = `http://localhost:${port}`;
module.exports = merge.smart(baseConfig, {
    devServer: {
        transportMode: 'ws',
        publicPath,
        contentBase: 'dist',
        port: 9000,
        hot: true,
        compress: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        watchOptions: {
            aggregateTimeout: 300,
            ignored: /node_modules/,
            poll: 100
        },
        stats: 'errors-only',
        injectClient: false,
        before() {

            spawn('npm', ['run', 'start-main-dev'], {
                shell: true,
                env: process.env,
                stdio: 'inherit'
            })
                .on('close', code => process.exit(code))
                .on('error', spawnError => console.error(spawnError));
        }

    }
});


