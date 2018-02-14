/* note-view.js
    
    Note view object.
*/

const $ = window.jQuery;

/* Note view object.
*/
class NoteView {
    //
    // STATIC PROPERTIES
    //
    
    //
    // PROPERTIES
    //
    
    // Reference to controller object for the view.
    _controller = null;
    
    // Note wrapper jQuery element in the DOM tree.
    noteElem = null;
    
    // Autosave debounce timeout ID.
    _debounce = -1;
    
    /* Constructor for NoteView.
    */
    constructor() {}
    
    /* Destructor for NoteView.
    */
    destroy() {
        this._controller = null;
    }
    
    //
    // STATIC METHODS
    //
    
    //
    // METHODS
    //
    
    /* Sets the controller for the view.
        
        controller - NoteController object.
    */
    setController(controller) {
        this._controller = controller;
    }
    
    /* Gets the note element if one exists.
        
        Returns the note jQuery element, or an empty jQuery element if no note
        element exists.
    */
    getNote() {
        return this.noteElem instanceof $ ? this.noteElem : $();
    }
    
    /* Enables or disables edit mode.
        
        mode - True to enable edit mode, false otherwise. Defaults to true.
    */
    enableEditMode(mode) {
        mode = !!(mode || undefined === mode);
        
        var noteElem = this.noteElem;
        
        // Stop if note element does not currently exist
        if (!noteElem) {
            return;
        }
        
        mode ? noteElem.addClass("edit") : noteElem.removeClass("edit");
        noteElem.prop("contentEditable", mode);
    }
    
    /* Renders the note.
        
        data - DOM data to render.
    */
    render(data) {
        var existing = this.noteElem,
            wrapper = $("<main role='main' data-id=" + this._controller.id +
                ">"),
            prev;
        
        wrapper.html(data.content);
        wrapper.data("settings", data.settings);
        
        this.noteElem = wrapper;
        this._attachEventHandlers(wrapper);
        
        if (existing) {
            prev = existing.prev();
            existing.remove();
            wrapper.insertAfter(prev);
        }
        else {
            $("body").prepend(wrapper);
        }
        
        // Synchronize with the controller's edit mode state
        this.enableEditMode(this._controller.editMode);
    }
    
    /* Attaches event handlers to a note wrapper element.
        
        wrapper - Note wrapper jQuery element.
    */
    _attachEventHandlers(wrapper) {
        wrapper.on("keydown blur", this.triggerAutoSave);
    }
    
    /* Attempts a debounced save action on various events.
        
        e - Event object (various).
    */
    triggerAutoSave = (e) => {
        // Don't attempt an autosave if edit mode is disabled
        if (!this.noteElem || "true" !== this.noteElem[0].contentEditable) {
            return;
        }
        
        clearTimeout(this._debounce);
        
        this._debounce = setTimeout(() => {
            clearTimeout(this._debounce);
            
            this._controller.save();
        }, 500);
    }
}

module.exports = NoteView;
