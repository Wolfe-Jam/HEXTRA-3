const webpack = require('webpack');

module.exports = function override(config, env) {
    // Add fallbacks for node modules that Jimp depends on
    config.resolve = {
        ...config.resolve,
        fallback: {
            ...config.resolve.fallback,
            fs: false,
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
            util: require.resolve('util/'),
            assert: require.resolve('assert/'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            url: require.resolve('url/'),
            querystring: require.resolve('querystring-es3'),
            zlib: require.resolve('browserify-zlib'),
            crypto: require.resolve('crypto-browserify'),
        },
        modules: ['node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            'semver': require.resolve('semver'),
            'fs-extra': require.resolve('fs-extra'),
        }
    };

    // Add buffer to plugins
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ];

    // Ensure proper module rules
    config.module = {
        ...config.module,
        rules: [
            ...config.module.rules,
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ]
                    }
                }
            }
        ]
    };

    return config;
};
