/*
    This script handles loading resource files.
*/

/**
 * Gets text from a file.
 * @param {string} path The path to the resource file. Starts from resources/
 * @param {function(string):void} callback The function to call once the resource has loaded.
 */
export function loadResource(path, callback) {
    //Create a request to load the file
    var request = new XMLHttpRequest();
    request.open("GET", "resources/" + path);
    request.onreadystatechange = function () {
        //Check if request has been handled
        if (request.readyState == XMLHttpRequest.DONE) {
            //Check if file was successfully retrieved
            if (request.status == 200) {
                console.log("[ResourceLoader] Finished loading file \"" + path + "\"");
                setTimeout(callback, 0, request.responseText);
            } else {
                console.log("[ResourceLoader] Failed to load file \"" + path + "\" with code " + request.status);
            }
            
        }
    };
    request.send();
}