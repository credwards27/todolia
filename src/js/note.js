/* note.js
    
    Entry point script for note view.
*/

"use strict";

const Note = require("~/components/note"),
    $ = window.jQuery;

/* Document ready initializer.
*/
function init() {
    var note = new Note("dev");
    note.render();
}

$(init);
