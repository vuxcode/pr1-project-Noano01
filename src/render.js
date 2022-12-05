/*
    Renders things to screen.
*/

import * as ResourceHandler from "./resources.js";

//The canvas where everything is rendered.
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

//The canvas that is used to detect what was clicked.
const click_canvas = document.getElementById("click_canvas");
const click_gl = click_canvas.getContext("webgl");

//The shader program
var program;

var vrtxPosLoc;
var vrtxPosBuffer;

const vrtx_size = 2;

var has_initialized = false;

export function hasFinished() {
    return has_initialized;
}

/**
 * Clear everything from the screen.
 */
export function clear() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

/**
 * Compiles a shader from source
 * @param {WebGLRenderingContext} context The GL context to use.
 * @param {*} type What kind of shader it is.
 * @param {string} source The name of the script containing the shader code.
 * @param {function(shader)} callback The function to call once finished.
 */
function compileShader(context, type, source, callback) {
    ResourceHandler.loadResource(source, (text) => {
        var shader = context.createShader(type);
        //Load and compile the shader
        context.shaderSource(shader, text);
        context.compileShader(shader);
        //Check whether it compiled correctly. And if so, return it.
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            setTimeout(callback, 0, shader);
            return;
        }
        //Provide log and delete shader, in case of error.
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    });
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
    //This is really ugly because the program has to wait for the server to send the shaders.
    compileShader(gl, gl.VERTEX_SHADER, "vertex.glsl", (v_shader) => {
        compileShader(gl, gl.FRAGMENT_SHADER, "fragment.glsl", (f_shader) => {
            //Put togetther the shaders
            program = createProgram(gl, v_shader, f_shader);
            //Get where to put the vertices
            vrtxPosLoc = gl.getAttribLocation(program, "v_position");
            vrtxPosBuffer = gl.createBuffer();
            has_initialized = true;
            console.log("Shader loaded successfully!");
        });
    });
}

/**
 * Make sure the resolution of the canvases matches their actual size.
 */
export function resizeScreen() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    click_canvas.width = canvas.clientWidth;
    click_canvas.height = canvas.clientHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);
    click_gl.viewport(0, 0, canvas.width, canvas.height);
}

export function prepareRender() {
    resizeScreen();
    clear();
    gl.useProgram(program);

    gl.enableVertexAttribArray(vrtxPosLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vrtxPosBuffer);
    gl.vertexAttribPointer(vrtxPosLoc, vrtx_size, gl.FLOAT, false, 0, 0);
}

/**
 * Draw object to context
 * @param {Number[]} object 
 * @param {*} context 
 * @param {*} buffer
 */
function render(object, context, buffer) {
    //Bind buffer to write to it. This might be redundant.
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    //Write vertices to buffer
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(object), context.STATIC_DRAW);
    //Draw every vertex.
    context.drawArrays(context.TRIANGLES, 0, object.length/vrtx_size);
}

//TODO: remove
export function test() {
    render([0,0,1,0,0,1], gl, vrtxPosBuffer);
}


/**
 * Draws an object on screen
 * @param {*} object The object to draw
 * @param {function()} callback The function that gets called when the item is pressed
 */
export function draw(object, callback) {

}