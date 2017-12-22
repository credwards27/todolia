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
    
    /* Generates content DOM for a note.
        
        data - Array of content nodes.
        
        Returns a jQuery collection of elements containing the provided data.
        The returned object will be empty if the provided data is invalid.
    */
    static getDom(data) {
        if (!(data instanceof Array)) {
            return $();
        }
        
        var wrapper = $("<div>"),
            elem, label, curr, i, l;
        
        for (i=0, l=data.length; i<l; ++i) {
            curr = data[i];
            
            if (!curr) { continue; }
            
            if (typeof curr === "string") {
                // Raw string, add a paragraph
                elem = $("<p>").html(curr);
            }
            else if (curr.hasOwnProperty("checked")) {
                // Checkbox
                elem = $("<div>").append(
                    $("<input>").attr("type", "checkbox")
                        .prop("checked", !!curr.checked)
                );
                
                label = $("<label>");
                
                if (curr.text && typeof curr.text === "string") {
                    label.append(curr.text);
                }
                
                elem.append(label);
            }
            else {
                continue;
            }
            
            wrapper.append(elem);
        }
        
        return wrapper.contents();
    }
    
    //
    // METHODS
    //
    
    /* Sets the controller for the view.
        
        controller - NoteController object.
    */
    setController(controller) {
        this._controller = controller;
    }
    
    /* Enables or disables edit mode.
        
        mode - True to enable edit mode, false otherwise. Defaults to true.
    */
    enableEditMode(mode) {
        mode = mode || undefined === mode;
        
        var main = $("main[data-id='" + this._controller.id + "']");
        
        mode ? main.addClass("edit") : main.removeClass("edit");
        main.prop("contentEditable", mode);
    }
    
    /* Renders the note.
    */
    render() {
        var existing = $("main"),
            wrapper = $("<main role='main' data-id=" + this._controller.id +
                ">"),
            dom = NoteView.getDom(this._controller.data),
            prev;
        
        wrapper.append(dom);
        
        this._attachEventHandlers(wrapper);
        
        if (existing.length) {
            prev = existing.prev();
            existing.remove();
            wrapper.insertAfter(prev);
        }
        else {
            $("body").prepend(wrapper);
        }
    }
    
    /* Attaches event handlers to a note wrapper element.
        
        wrapper - Note wrapper jQuery element.
    */
    _attachEventHandlers(wrapper) {
        wrapper.on("keydown blur", this.triggerAutoSave);
    }
    
    /* Attempts a debounced save action on various events.
        
        See this._getBoundHandler().
        
        e - Event object (various).
    */
    triggerAutoSave = (e) => {
        clearTimeout(this._debounce);
        
        this._debounce = setTimeout(() => {
            clearTimeout(this._debounce);
            this._controller.save();
        }, 500);
    }
}

module.exports = NoteView;
