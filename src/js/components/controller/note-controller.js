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
    
    // Autosave debounce timeout ID.
    _debounce = -1;
    
    /* Constructor for NoteController.
        
        id - Note ID name.
    */
    constructor(id) {
        this._id = id;
    }
    
    /* Destructor for NoteController.
    */
    destroy() {}
    
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
    
    /* Enables or disables edit mode.
        
        mode - True to enable edit mode, false otherwise. Defaults to true.
    */
    enableEditMode(mode) {
        mode = mode || undefined === mode;
        
        var main = $("main[data-id='" + this._id + "']");
        
        mode ? main.addClass("edit") : main.removeClass("edit");
        main.prop("contentEditable", mode);
    }
    
    /* Renders the note.
    */
    render() {
        var existing = $("main"),
            wrapper = $("<main role='main' data-id=" + this._id + ">"),
            dom = NoteController.getDom(this._data),
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
    
    /* Saves the note data.
    */
    save() {
    }
    
    /* Attaches event handlers to a note wrapper element.
        
        wrapper - Note wrapper jQuery element.
    */
    _attachEventHandlers(wrapper) {
        wrapper.on("keydown blur", this._debounceAutoSave);
    }
    
    /* Attempts a debounced save action on various events.
        
        See this._getBoundHandler().
        
        e - Event object (various).
    */
    _debounceAutoSave = (e) => {
        clearTimeout(this._debounce);
        
        this._debounce = setTimeout((function() {
            clearTimeout(this._debounce);
            this.save();
        }).bind(this), 500);
    }
}

module.exports = NoteController;
