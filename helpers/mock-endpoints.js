/* mock-endpoints.js
    
    REST endpoints for mock server.
*/

// Dependencies.
const querystring = require("querystring"),
    fs = require("fs"),
    server = require("./mock-server"),
    validate = require("../src/js/utils/validate"),
    fstr = require("../src/js/utils/format-str");

// Directory path for data files (with trailing slash).
const DATA_PATH = process.env.HOME + "/Library/Application Support/Todolia/",
    
    // Error response objects.
    ERRORS = {
        "non-directory": {
            status: 500,
            message: "'%s' exists, but is not a directory"
        },
        
        "invalid-id": {
            status: 400,
            message: "Note ID '%s' is invalid"
        },
        
        "invalid-note": {
            status: 400,
            message: "Invalid note format"
        },
        
        "note-not-found": {
            status: 404,
            message: "Note '%s' was not found"
        },
        
        "read-error": {
            status: 500,
            message: "Note '%s' could not be retrieved"
        },
        
        "note-corrupt": {
            status: 500,
            message: "Note '%s' is corrupt and could not be opened"
        },
        
        "write-error": {
            status: 500,
            message: "Note '%s' could not be saved"
        },
        
        "invalid-request": {
            status: 400,
            message: "Request data must be non-empty, valid JSON"
        },
        
        "unknown-error": {
            status: 500,
            message: "An unknown error has occurred"
        }
    };

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
            return getErrorObj("non-directory", path.replace(/\/+$/, ""));
        }
    }
}

/* Gets a predefined error object.
    
    code - Error code of the object to retrieve.
    ...replacements - String replacements for error messages.
*/
function getErrorObj(code) {
    var error = ERRORS[code];
    
    if (!error) {
        return ERRORS["unknown-error"];
    }
    
    error.message = typeof error.message === "string" ? error.message : "";
    error.message = fstr(error.message, Array.prototype.slice(arguments, 1));
    
    return error;
}

/* Gets note data from persistent storage.
    
    id - Note ID.
    success - Success callback. First argument will be the note data.
    error - Error callback. First argument will be an error object.
*/
function getNote(id, success, error) {
    // Exit if note ID is invalid
    if (!validate.isValidNoteId(id)) {
        error(getErrorObj("invalid-id", id));
        return;
    }
    
    var notePath = DATA_PATH + "notes/" + id + ".json";
    
    // Make sure note exists
    if (!fs.existsSync(notePath)) {
        error(getErrorObj("note-not-found", id));
        return;
    }
    
    // Open the note file
    fs.readFile(
        notePath,
        null,
        (err, data) => {
            if (err) {
                error(getErrorObj("read-error", id));
                return;
            }
            
            try {
                var json = JSON.parse(data.toString());
            }
            catch (e) {
                // Note is not valid JSON
                error(getErrorObj("note-corrupt", id));
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
        error(getErrorObj("invalid-id", id));
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
                error(getErrorObj("write-error", id));
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
        err = getErrorObj("invalid-id", id);
        
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
            err = getErrorObj("invalid-request");
            
            res.statusCode = err.status;
            res.end(JSON.stringify(err));
            return;
        }
        
        // Make sure note ID is present
        if (!validate.isValidNoteId(data.id)) {
            err = getErrorObj("invalid-id", data.id);
            
            res.statusCode = err.status;
            res.end(JSON.stringify(err));
            return;
        }
        
        data = validate.getSanitizedNote(data);
        
        // Validate note format
        if (!validate.isValidNote(data)) {
            err = getErrorObj("invalid-note");
            
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

;(function() {
    var errors = ERRORS,
        err, code;
    
    // Add error codes to error objects
    for (code in errors) {
        if (!errors.hasOwnProperty(code)) { continue; }
        errors[code].code = code;
    }
})();

initPersistentStorage();

module.exports = server;
