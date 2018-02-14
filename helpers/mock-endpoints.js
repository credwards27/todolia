/* mock-endpoints.js
    
    REST endpoints for mock server.
*/

// Dependencies.
const querystring = require("querystring"),
    fs = require("fs"),
    server = require("./mock-server"),
    validate = require("~/utils/validate"),
    getError = require("~/utils/errors");

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
            return getError("non-directory", path.replace(/\/+$/, ""));
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
    if (!validate.isValidNoteId(id)) {
        error(getError("invalid-id", id));
        return;
    }
    
    var notePath = DATA_PATH + "notes/" + id + ".json";
    
    // Make sure note exists
    if (!fs.existsSync(notePath)) {
        error(getError("note-not-found", id));
        return;
    }
    
    // Open the note file
    fs.readFile(
        notePath,
        null,
        (err, data) => {
            if (err) {
                error(getError("read-error", id));
                return;
            }
            
            try {
                var json = JSON.parse(data.toString());
            }
            catch (e) {
                // Note is not valid JSON
                error(getError("note-corrupt", id));
                return;
            }
            
            json.id = id;
            json = validate.getSanitizedNote(json);
            
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
function saveNote(id, data, success, error) {
    // Exit if note ID is invalid
    if ((!validate.isValidNoteId(id))) {
        error(getError("invalid-id", id));
        return;
    }
    
    data = validate.getSanitizedNote(data);
    
    // Attempt to write to file
    fs.writeFile(
        DATA_PATH + "notes/" + id + ".json",
        JSON.stringify(data),
        {
            mode: 0o644
        },
        (err) => {
            if (err) {
                error(getError("write-error", id));
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
    var qs = req.url.split("?")[1],
        args = querystring.parse(qs),
        id = args.id,
        err;
    
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    
    // Verify ID
    if (!validate.isValidNoteId(id)) {
        err = getError("invalid-id", id);
        
        res.statusCode = err.status;
        res.end(JSON.stringify(err));
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
        var data, err;
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        
        // Parse the request data
        try {
            data = JSON.parse(body);
        }
        catch (e) {
            err = getError("invalid-request");
            
            res.statusCode = err.status;
            res.end(JSON.stringify(err));
            return;
        }
        
        // Make sure note ID is present
        if (!validate.isValidNoteId(data.id)) {
            err = getError("invalid-id", data.id);
            
            res.statusCode = err.status;
            res.end(JSON.stringify(err));
            return;
        }
        
        data = validate.getSanitizedNote(data);
        
        // Validate note format
        if (!validate.isValidNote(data)) {
            err = getError("invalid-note");
            
            res.statusCode = err.status;
            res.end(JSON.stringify(err));
            return;
        }
        
        // Save the note to disk
        saveNote(data.id, data, () => {
            res.end(JSON.stringify("Note '" + data.id + "' saved"));
        }, (e) => {
            res.end(JSON.stringify(e));
        });
    });
}, "post");

initPersistentStorage();

module.exports = server;
