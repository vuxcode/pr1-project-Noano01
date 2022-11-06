/*
    This script handles loading resource files.
*/

/**
 * Gets text from a file.
 * @param {string} path The path to the resource file. Starts from resources/
 * @param {function(string):void} callback The function to call once the resource has loaded.
 */
export function loadResource(path, callback) {
    var element = document.createElement("script");
    element.type = "text/plain";
    element.src = "resources/"+path;
    element.onload = function() {
        console.log("[ResourceLoader] Finished loading file \""+path+"\"");
        callback(console.text);
        element.remove();
    };
    document.head.appendChild(element);
}