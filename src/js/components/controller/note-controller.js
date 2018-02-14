/* note-controller.js
    
    Note controller class object.
*/

// Dependencies.
const validate = require("~/utils/validate");

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
    
    // True if note is in edit mode, false otherwise.
    editMode = false;
    
    // Reference to note view object.
    _view = null;
    
    // Reference to note model object.
    _model = null;
    
    /* Constructor for NoteController.
        
        id - Note ID name.
        view - Note view object.
        model - Note model object.
    */
    constructor(id, view, model) {
        this.id = id;
        this._view = view;
        this._model = model;
        
        view.setController(this);
        model.setController(this);
        
        this.load();
    }
    
    /* Destructor for NoteController.
    */
    destroy() {
        this._view.destroy();
        this._model.destroy();
        
        this._view = null;
        this._model = null;
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
        this.editMode = !!(mode || undefined === mode);
        this._view.enableEditMode(mode);
    }
    
    /* Loads the note data from the model.
    */
    load() {
        this._model.getData(
            this.id,
            (d) => {
                this._view.render(d);
            },
            (e) => {
                console.log(e);
            }
        );
    }
    
    /* Saves the note data to the model.
    */
    save() {
        var elem = this._view.getNote(),
            data = validate.getSanitizedNote({
                id: this.id,
                content: elem.html(),
                settings: elem.data("settings")
            });
        
        this._model.setData(
            data,
            (d) => {
                console.log("saved");
            }, (e) => {
                console.log(e);
            }
        );
    }
}

module.exports = NoteController;
