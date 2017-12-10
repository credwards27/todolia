/* note.js
    
    Entry point script for note view.
*/

"use strict";

const NoteController = require("~/components/controller/note-controller"),
    $ = window.jQuery;

/* Document ready initializer.
*/
function init() {
    var note = new NoteController("dev");
    note.render();
}

$(init);
