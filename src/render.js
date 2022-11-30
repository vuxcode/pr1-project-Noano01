/*
    Renders things to screen.
*/

//The canvas where everything is rendered.
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

//The canvas that is used to detect what was clicked.
const click_canvas = document.getElementById("click_canvas");
const click_gl = click_canvas.getContext("webgl");

/**
 * Clear everything from the screen.
 */
export function clear();

/**
 * Make sure the resolution of the canvases matches their actual size.
 */
export function resizeScreen() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    click_canvas.width = canvas.clientWidth;
    click_canvas.height = canvas.clientHeight;
}

/**
 * Draw object to context
 * @param {*} object 
 * @param {*} context 
 */
function render(object, context);



/**
 * Draws an object on screen
 * @param {*} object The object to draw
 * @param {function()} callback The function that gets called when the item is pressed
 */
export function draw(object, callback);