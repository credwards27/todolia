/* note.js
    
    Note clase object.
*/

const $ = window.jQuery;

/* Note object.
*/
class Note {
    //
    // STATIC PROPERTIES
    //
    
    //
    // PROPERTIES
    //
    
    // Unique note ID name.
    _id = null;
    
    /* Constructor for Note.
        
        id - Note ID name.
    */
    constructor(id) {
        this._id = id;
    }
    
    /* Destructor for Note.
    */
    destroy() {}
    
    //
    // STATIC METHODS
    //
    
    //
    // METHODS
    //
}

module.exports = Note;
