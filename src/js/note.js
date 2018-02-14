/* note.js
    
    Entry point script for note view.
*/

"use strict";

const NoteView = require("~/components/view/note-view"),
    NoteModel = require("~/components/model/note-model-browser"),
    NoteController = require("~/components/controller/note-controller"),
    $ = window.jQuery;

/* Document ready initializer.
*/
function init() {
    var note = new NoteController("dev", new NoteView(), new NoteModel());
}

$(init);
