/*
    Renders things to screen.
*/

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

const click_canvas = null;
const click_gl = null;// click_canvas.getContext("webgl");

/**
 * Clear everything from the screen.
 */
export function clear();

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