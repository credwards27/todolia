// Dependencies.
const webpack = require("webpack"),
    path = require("path");

module.exports = {
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            }
        ]
    }
};
