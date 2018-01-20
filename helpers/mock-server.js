/* test-server.js
    
    Basic test server to allow backend model testing.
*/

const http = require("http");

const server = {
    // True to allow non-REST URLs to pass without returning an error.
    allowNonRest: false,
    
    // Collection of handlers keyed by HTTP method, then by route path.
    _handlers: {},
    
    /* Starts the test server.
        
        port - Port number on which to serve requests. Defaults to 8181.
    */
    start: function(port) {
        port = parseInt(port, 10);
        port = !isNaN(port) ? port : 8080;
        
        http.createServer(this.dispatch).listen(port, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            
            console.log("Mock server listening at http://localhost:" + port);
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
        
        Returns true if the request was handled by a registred REST endpoint,
        false otherwise.
    */
    dispatch: function(req, res) {
        var method = req.method.toLowerCase(),
            name = req.url.match(/^\/rest\/(.*?)\/?$/i),
            responseData = {
                status: 404,
                message: "Route not found"
            },
            handler;
        
        if (!name) {
            // Empty route, end the response if only REST requests are allowed
            if (!this.allowNonRest) {
                res.end(JSON.stringify(responseData));
            }
            
            return false;
        }
        
        name = name[1].toLowerCase();
        
        // Set default response headers
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        
        if (!this._handlers[method]) {
            // No handlers registered for the request method
            res.end(JSON.stringify(responseData));
            return false;
        }
        
        handler = this._handlers[method][name];
        
        if (typeof handler !== "function") {
            // No handler for the request method
            res.end(JSON.stringify(responseData));
            return false;
        }
        
        // Run the handler
        res.statusCode = 200;
        handler.call(undefined, req, res);
        
        return true;
    }
};

module.exports = server;
