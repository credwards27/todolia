// Gulp dependencies
const gulp = require("gulp"),
    webpack = require("webpack-stream"),
    WebpackUglify = require("uglifyjs-webpack-plugin"),
    sass = require("gulp-sass"),
    cleanCss = require("gulp-clean-css"),
    sourcemaps = require("gulp-sourcemaps"),
    rename = require("gulp-rename"),
    plumber = require("gulp-plumber"),
    
    // Other dependencies
    minimist = require("minimist"),
    minimistOpts = require("minimist-options"),
    liveServer = require("live-server"),
    runSequence = require("run-sequence"),
    del = require("del"),
    path = require("path"),
    
    mockServer = require("./helpers/mock-endpoints");

// Environment flags.
var env = {
    // Environment paths.
    PATH: {
        // Source paths.
        SRC: {
            // Generic build source path root.
            ROOT: "src",
            
            // SASS build source path.
            SASS: "sass",
            
            // JS build source path.
            JS: "js"
        },
        
        // Destination output paths.
        DEST: {
            // Generic build output path root.
            ROOT: "app/assets",
            
            // SASS build output path.
            SASS: "css",
            
            // JS build output path.
            JS: "js"
        }
    },
    
    // Argument configuration.
    ARG_OPTS: {
        target: {
            type: "string",
            alias: "t",
            default: "note"
        }
    },
    
    // Object containing command line arguments.
    args: null,
    
    // Flag to specify that the current task sequence is for production.
    prodMode: false,
    
    // Flag to specify whether or not webpack build tasks should watch for
    // changes.
    webpackWatch: false
},
    
    // Collection of task handler functions.
    tasks = {
        /* Makes all subsequent tasks run in production mode (if supported).
        */
        "prod-mode": function() {
            env.prodMode = true;
        },
        
        /* Watches the project for changes and recompiles.
        */
        watch: function() {
            env.webpackWatch = true;
            
            gulp.watch(env.PATH.SRC.SASS + "/**/*.scss", [ "sass" ]);
            gulp.watch(env.PATH.SRC.JS + "/**/*.js", [ "js" ]);
        },
        
        /* Clears the build destination directories for a clean build.
        */
        clean: function() {
            return del([
                env.PATH.DEST.SASS + "/**/*",
                env.PATH.DEST.JS + "/**/*"
            ]);
        },
        
        /* SASS build task.
        */
        sass: function() {
            console.log("Compiling stylesheets...");
            
            var target = env.args["target"],
                action = gulp.src(env.PATH.SRC.SASS + "/" + target + ".scss");
            
            if (!env.prodMode) {
                action = action.pipe(sourcemaps.init());
            }
            
            action = action.pipe(sass().on("error", sass.logError))
                .pipe(cleanCss());
            
            if (!env.prodMode) {
                action = action.pipe(sourcemaps.write());
            }
            
            action = action.pipe(rename(target + ".css"))
                .pipe(gulp.dest(env.PATH.DEST.SASS));
            
            return action;
        },
        
        /* JS build task.
        */
        js: function() {
            console.log("Compiling JS...");
            
            var target = env.args["target"],
                config = require("./webpack.config.js");
            
            if (env.webpackWatch) {
                config.watch = true;
            }
            
            if (!env.prodMode) {
                config.devtool = "source-map";
            }
            else {
                config.plugins = config.plugins instanceof Array ?
                    config.plugins : [];
                
                config.plugins.push(new WebpackUglify());
            }
            
            config.output = {
                path: path.resolve(env.PATH.DEST.JS),
                filename: target + ".bundle.js"
            };
            
            return gulp.src(env.PATH.SRC.JS + "/" + target + ".js")
                .pipe(webpack(config))
                .pipe(gulp.dest(env.PATH.DEST.JS));
        },
        
       // Complete build task.
        build: [ "sass", "js" ],
        
        /* Production build task.
        */
        deploy: function() {
            runSequence("clean", "prod-mode", "build");
        },
        
        /* Live development server task.
        */
        server: function() {
            runSequence("watch", "build");
            
            var target = env.args["target"],
                root = env.PATH.DEST.ROOT;
            
            mockServer.allowNonRest = true;
            
            liveServer.start({
                port: 8080,
                host: "localhost",
                root: "app",
                file: "app/" + target + ".html",
                open: false,
                wait: 250,
                watch: [ "app/**" ],
                
                middleware: [
                    function(req, res, next) {
                        if (!mockServer.dispatch(req, res)) {
                            !req.finished && next();
                        }
                    }
                ]
            });
        },
        
        //
        // Aliases
        //
        
        w: [ "watch" ],
        s: [ "server" ],
        
        // Default gulp task.
        "default": [ "server" ]
    };

// Set up paths
(function() {
    var paths = env.PATH,
        groups = [ "SRC", "DEST" ],
        group, root, path, k, i, l;
    
    for (i=0, l=groups.length; i<l; ++i) {
        group = env.PATH[groups[i]];
        root = group.ROOT = group.ROOT.replace(/\/+$/, "");
        
        for (k in group) {
            if (!group.hasOwnProperty(k) || "ROOT" === k) { continue; }
            
            path = group[k].replace(/^\/+/, "");
            group[k] = root + "/" + path;
        }
    }
    
    // Capture CLI arguments
    env.args = Object.freeze(
        minimist(process.argv.slice(2), minimistOpts(env.ARG_OPTS)));
})();

// Link tasks with handlers
(function() {
    var curr, k;
    
    for (k in tasks) {
        if (tasks.hasOwnProperty(k)) {
            curr = tasks[k];
            
            if (curr.pre instanceof Array && typeof curr.task === "function") {
                // Special case, handler with pre-tasks
                gulp.task(k, curr.pre, curr.task);
            }
            else {
                // Normal case, handler or task list
                gulp.task(k, curr);
            }
        }
    }
})();
