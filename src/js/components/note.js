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
    
    // Note content nodes.
    _data = [
        "This is free text. It can be freely edited with formatting.",
        
        "Text can be <strong>strong</strong>, <em>emphasized</em>, " +
            "<span class='u'>underlined</span>, and <span " +
            "class='s'>crossed out</span>.",
        
        "You can also <strong>mix <em>and<em> match</strong> " +
            "formatting. It doesn't <span class='u'>have to be <span " +
            "class='s'>perfect</span></span>",
        
        "Finally, you can also have <a " +
            "href='http://example.com'>links</a>",
        
        {
            checked: false,
            text: "Most importantly, you can have checklists!"
        },
        
        {
            checked: false,
            text: "They can be <strong>formatted!</strong>"
        },
        
        {
            checked: true,
            text: "This one's finished!"
        }
    ];
    
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
