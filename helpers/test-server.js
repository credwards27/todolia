/* test-server.js
    
    Basic test server to allow backend model testing.
*/

const http = require("http");

const server = {
    // Collection of handlers keyed by HTTP method, then by route path.
    _handlers: {},
    
    /* Starts the test server.
        
        port - Port number on which to serve requests. Defaults to 8181.
    */
    start: function(port) {
        port = parseInt(port, 10);
        port = !isNaN(port) ? port : 8181;
        
        http.createServer(this._dispatch).listen(port, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            
            console.log("Test server listening on port " + port);
        });
    },
    
    /* Registers response handlers.
        
        route - Handler route (URL after leading slash).
        handler - Handler function to register.
        methods - String or array of HTTP method strings (supports 'GET' and
            'POST').
    */
    registerHandler: function(route, handler, methods) {
        if (typeof handler !== "function") { return; }
        
        methods = methods instanceof Array ? methods : [ methods ];
        
        methodLoop:
        for (let i=0, l=methods.length; i<l; ++i) {
            let method = methods[i];
            
            if (typeof method !== "string") { continue; }
            
            method.toLowerCase();
            
            switch (method) {
                case "get":
                case "post":
                break;
                
                default:
                continue methodLoop;
            }
            
            this._handlers[method] = this._handlers[method] || {};
            this._handlers[method][route.toLowerCase()] = handler;
        }
    },
    
    /* Handles incomming HTTP requests and dispatches the appropriate handler.
        
        IMPORTANT: This does NOT end the response object if dispatched to a
        registered handler; the handler must end the response object itself.
        
        req - Request object.
        res - Response object.
    */
    _dispatch: function(req, res) {
        var method = req.method.toLowerCase(),
            name = req.url.match(/^\/(.*?)\/?$/),
            responseData = {
                status: 404,
                message: "Route not found"
            },
            handler;
        
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        
        if (!name) {
            // Empty route
            res.end(JSON.stringify(responseData));
            return;
        }
        
        name = name[1].toLowerCase();
        
        if (!this._handlers[method]) {
            // No handlers registered for the request method
            res.end(JSON.stringify(responseData));
        }
        
        handler = this._handlers[method][name];
        
        if (typeof handler !== "function") {
            // No handler for the request method
            res.end(JSON.stringify(responseData));
            return;
        }
        
        // Run the handler
        res.statusCode = 200;
        handler.call(undefined, req, res);
    },
    
    /* Gets data from persistent storage.
        
        req - HTTP request object.
        res - HTTP response object.
        
        Returns data from persistent storage.
    */
    _getData: function(req, res) {
        res.end(JSON.stringify(true));
    },

    /* Saves data to persistent storage.
        
        req - HTTP request object.
        res - HTTP response object.
        
        Returns data saved to persistent storage.
    */
    _saveData: function(req, res) {
        var body = "";
        
        req.on("data", (chunk) => {
            body += chunk;
        });
        
        req.on("end", () => {
            var data = JSON.parse(body);
            
            res.end(JSON.stringify("Saving:\n" + body));
        });
    }
};

// Register default route handlers
server.registerHandler("get", server._getData, "get");
server.registerHandler("save", server._saveData, "post");

module.exports = server;
