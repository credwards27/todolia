/* test-server.js
    
    Basic test server to allow backend model testing.
*/

const http = require("http"),
    port = 8181,
    server = http.createServer(dispatch),
    handlers = {};

/* Handles incomming HTTP requests and dispatches the appropriate handler.
    
    IMPORTANT: This does NOT end the response object if dispatched to a
    registered handler; the handler must end the response object itself.
    
    req - Request object.
    res - Response object.
*/
function dispatch(req, res) {
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
    
    if (!handlers[method]) {
        // No handlers registered for the request method
        res.end(JSON.stringify(responseData));
    }
    
    handler = handlers[method][name];
    
    if (typeof handler !== "function") {
        // No handler for the request method
        res.end(JSON.stringify(responseData));
        return;
    }
    
    // Run the handler
    res.statusCode = 200;
    handler.call(undefined, req, res);
}

/* Gets data from persistent storage.
    
    req - HTTP request object.
    res - HTTP response object.
    
    Returns data from persistent storage.
*/
function getData(req, res) {
    res.end(JSON.stringify(true));
}

/* Saves data to persistent storage.
    
    req - HTTP request object.
    res - HTTP response object.
    
    Returns data saved to persistent storage.
*/
function saveData(req, res) {
    var body = "";
    
    req.on("data", (chunk) => {
        body += chunk;
    });
    
    req.on("end", () => {
        var data = JSON.parse(body);
        
        res.end(JSON.stringify("Saving:\n" + body));
    });
}

/* Registers response handlers.
    
    route - Handler route (URL after leading slash).
    handler - Handler function to register.
    methods - String or array of HTTP method strings (supports 'GET' and
        'POST').
*/
function registerHandler(route, handler, methods) {
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
        
        handlers[method] = handlers[method] || {};
        handlers[method][route.toLowerCase()] = handler;
    }
}

;(function(undefined) {

// Register route handlers
registerHandler("get", getData, "get");
registerHandler("save", saveData, "post");

// Start the server
server.listen(port, (err) => {
    if (err) { console.log(err); }
    
    console.log("Test server listening on port " + port);
});

})(void 0);
