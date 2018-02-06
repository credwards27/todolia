/* validation.js
    
    Validation and sanitization methods for notes and note-related data.
*/

module.exports = {
    /* Gets a sanitized note data object.
        
        data - Existing note data to apply to the returned object.
        
        Returns a formatted and sanitized note data object.
    */
    getSanitizedNote: function(data) {
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
    },
    
    /* Validates a note object.
        
        note - Note data object to validate.
        
        Returns true if note is valid for saving and loading, false otherwise.
    */
    isValidNote: function(note) {
        if (!note) {
            return false;
        }
        
        switch (true) {
            case this.isValidNoteId(note.id):
            case typeof note.content !== "string":
            case typeof note.settings !== "object":
                return false;
        }
        
        return true;
    },
    
    /* Validates a note ID.
        
        id - Note ID value to check.
        
        Returns true if the note ID is valid, false otherwise.
    */
    isValidNoteId: function(id) {
        var type = typeof id;
        
        switch (true) {
            case "string" === type && !id:
            case "string" !== type && "number" !== type:
            return false;
        }
        
        return true;
    }
};
