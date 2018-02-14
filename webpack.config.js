// Dependencies.
const webpack = require("webpack"),
    path = require("path");

module.exports = {
    resolve: {
        alias: {
            jquery: "jquery/src/jquery"
        }
    },
    
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            }
        ]
    },
    
    watch: false
};
