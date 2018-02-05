/* mock-endpoints.js
    
    REST endpoints for mock server.
*/

// Dependencies.
const server = require("./mock-server");

// Directory path for data files (with trailing slash).
const DATA_PATH = process.env.HOME + "/Library/Application Support/";

//
// Register default route handlers
//

/* Gets data from persistent storage.
*/
server.registerRoute("get", function(req, res) {
    res.end(JSON.stringify(true));
}, "get");

/* Saves data to persistent storage.
*/
server.registerRoute("save", function(req, res) {
    var body = "";
    
    req.on("data", (chunk) => {
        body += chunk;
    });
    
    req.on("end", () => {
        var data;
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        
        try {
            data = JSON.parse(body);
        }
        catch (e) {
            res.statusCode = 400;
            
            res.end(JSON.stringify({
                status: 400,
                error: "Request data must be non-empty, valid JSON"
            }));
            
            return;
        }
        
        res.end(JSON.stringify("Saving:\n" + body));
    });
}, "post");

module.exports = server;
