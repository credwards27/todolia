/* format-str.js
    
    Super simple formatted string replacement function.
*/

/* Applies formatted replacements to a given string.
    
    str - String with replacement markers.
    ...replacements - 1 or more replacements.
    
    Returns the string with replacements applied.
*/
module.exports = function(str) {
    var replacements = Array.prototype.slice.call(arguments, 1),
        idx = -1;
    
    return str.replace(/([^%])%(s|d)/g, (match, p1, p2) => {
        replacements;
        idx;
        
        var replacement = replacements[++idx],
            type = typeof replacement;
        
        if ("d" === p2) {
            // Numerical
            if ("number" === type) {
                replacement = replacement.toString();
            }
            else if ("string" === type) {
                replacement = replacement.match(/^\d+(?:\.\d+)?$/) ?
                    replacement : "";
            }
            else {
                replacement = "";
            }
        }
        else {
            // Plain string
            if ("string" !== type && "number" !== type) {
                replacement = "";
            }
            else {
                replacement = replacement.toString();
            }
        }
        
        return p1 + replacement;
    });
};
