/* mock-endpoints.js
    
    REST endpoints for mock server.
*/

// Dependencies.
const fs = require("fs"),
    server = require("./mock-server");

// Directory path for data files (with trailing slash).
const DATA_PATH = process.env.HOME + "/Library/Application Support/Todolia/";

/* Initializes persistent storage if necessary.
*/
function initPersistentStorage() {
    var dirs = [
        DATA_PATH,
        DATA_PATH + "notes"
    ],
        path, stat, i, l;
    
    for (i=0, l=dirs.length; i<l; ++i) {
        path = dirs[i];
        
        // Create directory if necessary
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
            continue;
        }
        
        // If path exists, make sure it's actually a directory
        stat = fs.statSync(path);
        
        if (!stat.isDirectory()) {
            return {
                code: "non-directory",
                error: "'" + path.replace(/\/+$/, "") + "' exists, but is " +
                    "not a directory"
            };
        }
    }
}


/* Writes data to a note file.
    
    id - Note ID.
    data - Data to write.
    success - Success callback.
    error - Error callback. First argument is an error object.
*/
function saveNote(id, content, settings, success, error) {
    // Exit if note ID is invalid
    if (typeof id !== "string" && typeof id !== "number") {
        error({
            status: 400,
            error: "Invalid ID '" + id + "' provided for note"
        });
        
        return;
    }
    
    var data = {
        id: id,
        content: content || "",
        settings: typeof settings === "object" ? settings : {}
    };
    
    // Attempt to write to file
    fs.writeFile(
        DATA_PATH + "notes/" + id + ".json",
        JSON.stringify(data),
        {
            mode: 0o644
        },
        (err) => {
            if (err) {
                error({
                    status: 500,
                    error: "Note '" + id + "' could not be saved"
                });
                
                return;
            }
            
            success();
        }
    );
}

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
        
        // Parse the request data
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
        
        // Make sure note ID is present
        if (typeof data.id !== "string" && typeof data.id !== "number") {
            res.statusCode = 400;
            
            res.end(JSON.stringify({
                status: 400,
                error: "No note ID provided"
            }));
            
            return;
        }
        
        // Save the note to disk
        saveNote(data.id, data.content, data.settings, () => {
            res.end(JSON.stringify("Note '" + data.id + "' saved"));
        }, (e) => {
            res.end(JSON.stringify(e));
        });
    });
}, "post");

initPersistentStorage();

module.exports = server;
