// Dependencies.
const webpack = require("webpack"),
    path = require("path");

module.exports = {
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                query: {
                    presets: [ "env" ],
                    plugins: [
                        "transform-es2015-parameters",
                        "transform-class-properties",
                        [ "babel-plugin-transform-builtin-extend", {
                            globals: [ "Error" ]
                        } ],
                        [ "babel-root-import", {
                            rootPathSuffix: "src/js"
                        } ]
                    ]
                }
            }
        ]
    }
};
