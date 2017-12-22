/* note-controller.js
    
    Note controller class object.
*/

const $ = window.jQuery;

/* NoteController object.
*/
class NoteController {
    //
    // STATIC PROPERTIES
    //
    
    //
    // PROPERTIES
    //
    
    // Unique note ID name.
    id = null;
    
    // Note content nodes.
    data = [
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
    
    // Reference to note view object.
    _view = null;
    
    /* Constructor for NoteController.
        
        id - Note ID name.
    */
    constructor(id, view) {
        this.id = id;
        this._view = view;
        
        view.setController(this);
        view.render();
    }
    
    /* Destructor for NoteController.
    */
    destroy() {
        this.data = null;
        
        this._view.destroy();
        this._view = null;
    }
    
    //
    // STATIC METHODS
    //
    
    //
    // METHODS
    //
    
    /* Enables or disables edit mode.
        
        mode - True to enable edit mode, false otherwise. Defaults to true.
    */
    enableEditMode(mode) {
        this._view.enableEditMode(mode);
    }
    
    /* Saves the note data.
    */
    save() {
    }
}

module.exports = NoteController;
