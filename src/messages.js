/*
    This script handles showing messages on screen.
*/

//Gets the HTML elements involved with showing messages.
const screen = document.getElementById("message_screen");
const buttons = document.getElementById("message_buttons");
const yes_button = document.getElementById("message_yes");
const no_button = document.getElementById("message_no");
const content = document.getElementById("message_content");
const next = document.getElementById("message_next");

//The time in miliseconds it takes to write one letter.
const write_speed = 100;
//The time in miliseconds it takes for the message box to appear.
const start_speed = 1600
//Whether the message screen is opened
var opened = false;

/**
 * Opens the message screen.
 */
 export function enter() {
    opened = true;
    //Disable mouse clicks
    screen.onclick = noClick;
    //Clean any leftover messaging.
    clearMessage();
    //Display messaging screen.
    screen.style.display = "block";
}

/**
 * Exits the message screen.
 */
export function exit() {
    opened = false;
    //Hide messaging screen.
    screen.style.display = "none";
}


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
    //Check if the message screen is actually open.
    if (!opened) {
        enter();
        setTimeout(writeText, start_speed, text, callback, index);
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
function noClick(event) {
    event.stopPropagation();
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
            //Call the callback
            setTimeout(callback, 0);
            screen.onclick = noClick;
        };
    });
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

/**
 * Display a text box with yes and no buttons.
 * @param {string} message 
 * @param {function(bool)} callback Function that handles the response. Remember to call exit().
 */
export function askBool(message, callback) {
    //Clear any previous messages.
    clearMessage();
    //Start writing the characters.
    setTimeout(writeText, write_speed, message, () => {
        //Make buttons visible
        buttons.style.display = "flex";
        //Detect when someone clicked yes.
        yes_button.onclick = () => {
            //Call the callback
            setTimeout(callback, 0, true);
        };
        //Detect when someone clicked yes.
        no_button.onclick = (event) => {
            //Call the callback
            event.stopPropagation();
            setTimeout(callback, 0, false);
        };
    });
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
    //Hide buttons
    //buttons.style.display = "none";
}