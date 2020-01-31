const path = require(`path`);

module.exports = {
    entry: {
        common: [`babel-polyfill`, `./src/common.js`],
    },
    output: {
        filename: `[name]-bundle.js`,
        path: path.resolve(__dirname, `public/scripts`)
    },
    module: {
        rules: [{
            test: /\.js$/,
            type: 'javascript/auto',
            exclude: /node_modules/,
            use: {
                loader: `babel-loader`,
                options: {
                    presets: [`env`],
                    plugins: [`transform-object-rest-spread`]
                }
            }
        }]
    },
    devtool: 'source-map'
}