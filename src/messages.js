/*
    This script handles showing messages on screen.
*/

//Gets the HTML elements involved with showing messages.
const screen = document.getElementById("message_screen");
const box = document.getElementById("message_box");
const content = document.getElementById("message_content");
const next = document.getElementById("message_next");

//The time in miliseconds it takes to write one letter.
const write_speed = 100;
/**
 * Writes text to text box character by character.
 * @param {string} text The text to write.
 * @param {function} callback What to do when done.
 * @param {number} index Which character in text should pe printed.
 */
function writeText(text, callback, index=0) {
    //If the entire string has already been written, call callback and then return.
    if (index >= text.length) {
        setTimeout(callback, write_speed)
        return;
    }
    //Add character at index to the text box.
    content.innerText = text.substring(0, index+1);
    //And then call this function again.
    setTimeout(writeText, write_speed, text, callback, index+1);
}

/**
 * Use to block mouse clicks from interacting.
 */
function noCLick(event) {
    event.noPropogation();
}

/**
 * Writes text to textbox and await user input.
 * @param {string} message The message to show.
 * @param {function} callback A callback function called when player clicks.
 */
export function showMessage(message, callback = exit) {
    //Clear any previous messages.
    clearMessage();
    //Start writing the characters.
    setTimeout(writeText, write_speed, message, () => {
        //Make the next dialogue triangle thing visible
        next.style.display = "block";
        //Detect when someone clicked to progress dialogue or finish.
        screen.onclick = () => {
            console.log("TEST");
            //Call the callback
            setTimeout(callback, 0);
            screen.onclick = noCLick;
        };
    });
}

showMessage("HELLO WORLD")

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
    //Remove text
    content.innerText = "";
    //Hide next arrow
    next.style.display = "none";
}

/**
 * Opens the message screen.
 */
export function open() {
    //Disable mouse clicks
    screen.onclick = noClick;
}

/**
 * Exits the message screen.
 */
export function exit() {

}