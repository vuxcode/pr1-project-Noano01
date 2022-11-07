/*
    This script handles showing messages on screen.
*/

//Gets the HTML elements involved with showing messages.
const screen = document.getElementById("message_screen");
const box = document.getElementById("message_box");

/**
 * Writes text to text box.
 * @param {string} text 
 */
function writeText(text) {

}

export function showMessage(message, callback = exit) {
    
}

/**
 * Displays multiple messages in a row.
 * @param {[string]} messages An array of messages to display.
 * @param {function} callback A callback function to call when done.
 */
export function showMessages(messages, callback = exit) {
    if (messages.length > 0 ) {
        //Show one message, and put the rest as a callback function
        showMessage(messages.shift(), () => {
            showMessages(messages, callback);
        })
    } else if (callback) {//If messages are empty, it means the callback should be called.
        setTimeout(callback, 0);
    }
}


export function askBool(message, callback) {

}

/**
 * Clears the message box.
 * Called between each message.
 */
function clearMessage() {

}

/**
 * Exits the message screen.
 */
export function exit() {

}