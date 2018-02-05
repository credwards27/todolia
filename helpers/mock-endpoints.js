/* mock-endpoints.js
    
    REST endpoints for mock server.
*/

// Dependencies.
const querystring = require("querystring"),
    fs = require("fs"),
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

/* Gets note data from persistent storage.
    
    id - Note ID.
    success - Success callback. First argument will be the note data.
    error - Error callback. First argument will be an error object.
*/
function getNote(id, success, error) {
    // Exit if note ID is invalid
    if (!validateNoteId(id)) {
        error({
            status: 400,
            error: "Invalid ID '" + id + "' provided for note"
        });
        
        return;
    }
    
    var notePath = DATA_PATH + "notes/" + id + ".json";
    
    // Make sure note exists
    if (!fs.existsSync(notePath)) {
        error({
            status: 404,
            error: "Note '" + id + "' was not found"
        });
        
        return;
    }
    
    // Open the note file
    fs.readFile(
        notePath,
        null,
        (err, data) => {
            if (err) {
                error({
                    status: 500,
                    error: "Note '" + id + "' could not be retrieved"
                });
                
                return;
            }
            
            try {
                var json = JSON.parse(data.toString());
            }
            catch (e) {
                // Note is not valid JSON
                error({
                    status: 500,
                    error: "Note '" + id + "' is corrupt"
                });
                
                return;
            }
            
            json.id = id;
            json = getSanitizedNote(json);
            
            success(json);
        }
    );
}

/* Writes data to a note file.
    
    id - Note ID.
    data - Data to write.
    success - Success callback.
    error - Error callback. First argument is an error object.
*/
function saveNote(id, content, settings, success, error) {
    // Exit if note ID is invalid
    if ((!validateNoteId(id))) {
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

/* Gets a sanitized note data object.
    
    data - Existing note data to apply to the returned object.
    
    Returns a formatted and sanitized note data object.
*/
function getSanitizedNote(data) {
    //
    // TODO: Add more settings sanitization when additional options are defined.
    //
    
    var note = {
        id: null,
        content: null,
        settings: {
            x: 0,
            y: 0
        }
    },
        ns = note.settings,
        ds;
    
    if (!data) {
        return note;
    }
    
    note.id = typeof data.id === "string" ? data.id : "";
    note.content = typeof data.content === "string" ? data.content : "";
    
    // Settings
    ds = data.settings || {};
    
    ns.x = typeof ds.x === "number" ? ds.x : 0;
    ns.y = typeof ds.y === "number" ? ds.y : 0;
    
    return note;
}

/* Validates a note ID.
*/
function validateNoteId(id) {
    var type = typeof id;
    
    switch (true) {
        case "string" === type && !id:
        case "string" !== type && "number" !== type:
        return false;
    }
    
    return true;
}

//
// Register default route handlers
//

/* Gets data from persistent storage.
*/
server.registerRoute("get", function(req, res) {
    var qs = req.url.split("?")[1],
        args = querystring.parse(qs),
        id = args.id;
    
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    
    if (typeof id !== "string") {
        res.statusCode = 400;
        
        res.end(JSON.stringify({
            status: 400,
            error: "No note ID provided"
        }));
        
        return;
    }
    
    // Get the note file and respond with the results
    getNote(id, (d) => {
        res.end(JSON.stringify(d));
    }, (e) => {
        res.statusCode = e.status;
        res.end(JSON.stringify(e));
    })
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
