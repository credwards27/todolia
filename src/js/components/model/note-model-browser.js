/* note-model-browser.js
    
    Development note model adapter for the browser version of the app.
*/

const validate = require("~/utils/validate"),
    $ = window.jQuery;

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
    
    // XHR object for getData().
    _xhrGetData = null;
    
    // XHR object for setData().
    _xhrSetData = null;
    
    /* Constructor for NoteModelBrowser.
    */
    constructor() {}
    
    /* Destructor for NoteModelBrowser.
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
    
    /* Sets the controller for the model.
        
        controller - NoteController object.
    */
    setController(controller) {
        this._controller = controller;
    }
    
    /* Gets data from persistent storage.
        
        success - Success callback. First argument will be retrieved data.
        error - Error callback. First argument will be an error object.
    */
    getData(id, success, error) {
        this._xhrGetData && this._xhrGetData.abort();
        
        // Exit if ID is invalid
        if (!validate.isValidNoteId(id)) {
            this._xhrGetData = null;
            error({
                status: 400,
                error: "Invalid ID '" + id + "' provided for note"
            });
            
            return;
        }
        
        // Load data from persistent storage
        this._xhrGetData = $.ajax(this._getDefaultAjaxArgs(
            "/rest/get",
            (d) => {
                success(validate.getSanitizedNote(d));
            },
            error,
            () => { this._xhrGetData = null; },
            {
                data: "id=" + id
            }
        ));
    }
    
    /* Sets data to persistent storage.
        
        data - Data to save.
        success - Success callback. First parameter will be response data.
        error - Error callback. First parameter will be an error object.
    */
    setData(data, success, error) {
        this._xhrSetData && this._xhrSetData.abort();
        this._xhrSetData = null;
        
        data = validate.getSanitizedNote(data);
        
        this._xhrSetData = $.ajax(this._getDefaultAjaxArgs(
            "/rest/save",
            (d) => {
                success(validate.getSanitizedNote(d));
            },
            error,
            () => { this._xhrSetData = null; },
            {
                method: "post",
                contentType: "application/json",
                data: JSON.stringify(data),
                processData: false
            }
        ));
    }
    
    /* Gets a default set of AJAX arguments.
        
        url - Request URL.
        success - Success callback. First parameter will be response data.
        error - Error callback. First parameter will be an error object.
        complete - Complete callback.
        args - Arguments object containing additional overrides for defaults.
        
        Returns an arguments object for jQuery.ajax().
    */
    _getDefaultAjaxArgs(url, success, error, complete, args) {
        // Default arguments object
        var _args = {
            url: url,
            method: "get",
            
            success: success,
            error: (e) => {
                var data = e.hasOwnProperty("responseJSON") ? e.responseJSON : {
                    status: e.status,
                    error: "An unknown error occurred"
                };
                
                error(data);
            },
            
            complete: complete
        };
        
        $.extend(_args, args);
        
        return _args;
    }
}

module.exports = NoteModelBrowser;
