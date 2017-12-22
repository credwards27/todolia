/* note-model-browser.js
    
    Development note model adapter for the browser version of the app.
*/

/* Note model adapter object for development (browser version of app)
*/
class NoteModelBrowser {
    //
    // STATIC PROPERTIES
    //
    
    //
    // PROPERTIES
    //
    
    // Reference to controller object connected to the model.
    _controller = null;
    
    /* Constructor for NoteModelBrowser.
    */
    constructor() {}
    
    /* Destructor for NoteModelBrowser.
    */
    destroy() {}
    
    //
    // STATIC METHODS
    //
    
    //
    // METHODS
    //
    
    /* Sets the controller for the model.
        
        controller - NoteController object.
    */
    setController(controller) {
        this._controller = controller;
    }
    
    /* Gets data from persistent storage.
    */
    getData() {
    }
    
    /* Sets data to persistent storage.
    */
    setData(data) {
    }
}

module.exports = NoteModelBrowser;
