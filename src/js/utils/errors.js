/* errors.js
    
    Collection of common error data objects with a standard getter.
*/

const fstr = require("~/utils/format-str");

// Error response objects.
const ERRORS = {
    "unknown-error": {
        status: 500,
        message: "An unknown error has occurred"
    },
    
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
    }
};

;(function() {
    var errors = ERRORS,
        err, code;
    
    // Add error codes to error objects
    for (code in errors) {
        if (!errors.hasOwnProperty(code)) { continue; }
        errors[code].code = code;
    }
})();

/* Gets a predefined error object.
    
    code - Error code of the object to retrieve.
    ...replacements - String replacements for error messages.
*/
module.exports = function(code) {
    var error = ERRORS[code],
        replacements = Array.prototype.slice.call(arguments, 1);
    
    if (!error) {
        return ERRORS["unknown-error"];
    }
    
    error.message = typeof error.message === "string" ? error.message : "";
    error.message = fstr(error.message, ...replacements);
    
    return error;
};
