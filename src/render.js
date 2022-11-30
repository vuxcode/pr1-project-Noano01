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
export function clear() {
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

/**
 * Compiles a shader from source
 * @param {WebGLRenderingContext} context The GL context to use.
 * @param {*} type What kind of shader it is.
 * @param {string} source The name of the script containing the shader code.
 * @returns The shader
 */
function compileShader(context, type, source) {
    var shader = context.createShader(type);
    //Load and compile the shader
    context.shaderSource(shader, document.getElementById(source).text);
    context.compileShader(shader);
    //Check whether it compiled correctly. And if so, return it.
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }
    //Provide log and delete shader, in case of error.
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

/**
 * Links together several shaders into a "program"
 * @param {WebGLRenderingContext} context The GL context to use.
 * @param {*} vertex The vertex shader.
 * @param {*} fragment The fragment shader.
 * @returns The shader program
 */
function createProgram(context, vertex, fragment) {
    var program = context.createProgram();
    //Attach the shaders to the program.
    context.attachShader(program, vertex);
    context.attachShader(program, fragment);
    context.linkProgram(program);
    //Check if successful.
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
    }
    //Provide log and delete program, in case of error.
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

export function setupShaders() {
    var v_shader = compileShader(gl, gl.VERTEX_SHADER, "vertex_shader");
    var f_shader = compileShader(gl, gl.FRAGMENT_SHADER, "fragment_shader");
    var program = createProgram(gl, v_shader, f_shader);
    
}

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