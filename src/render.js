/*
    Renders things to screen.
*/

import * as ResourceHandler from "./resources.js";
import * as MatrixMath from "./matrix.js";
import * as ModelHandler from "./model.js";

//The canvas where everything is rendered.
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

//The canvas that is used to detect what was clicked.
const click_canvas = document.getElementById("click_canvas");
const click_gl = click_canvas.getContext("webgl");

//The shader program
var program;

//The location of various shader uniforms
var colorLoc;
var matrixLoc;

var vrtxPosLoc;
var vrtxPosBuffer;

//The amount of dimensions each vector has. DO NOT CHANGE.
const vrtx_size = 3;

var projectionMatrix = MatrixMath.perspective(70, canvas.clientWidth, canvas.clientHeight, 10000);
var cameraMatrix = MatrixMath.identity();

var has_initialized = false;

export function hasFinished() {
    return has_initialized;
}

/**
 * Clear everything from the screen.
 */
export function clear() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
            //Get where to put the vertices and stuff
            colorLoc = gl.getUniformLocation(program, "u_color");
            matrixLoc = gl.getUniformLocation(program, "u_matrix");

            vrtxPosLoc = gl.getAttribLocation(program, "a_position");
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
    gl.useProgram(program);
    resizeScreen();
    clear();

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
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
function render(object, context, buffer, wireframe = false) {
    //Bind buffer to write to it. This might be redundant.
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    //Write vertices to buffer
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(object), context.DYNAMIC_DRAW);
    //Draw every vertex.
    if (wireframe) {
        gl.uniform4f(colorLoc,  1, 1, 1, 0); 
        context.drawArrays(context.LINES, 0, object.length/vrtx_size);
    } else {
        gl.uniform4f(colorLoc,  1, 0, 0, 0); 
        context.drawArrays(context.TRIANGLES, 0, object.length/vrtx_size);
    }
}



function degToRad(r) {
    return (r/180)*Math.PI;
}

export function setCamera(x,y,z,rx,ry,rz) {
    var m = MatrixMath.identity();
    m = MatrixMath.rotate(m, degToRad(-rx), degToRad(-ry), degToRad(-rz));
    m = MatrixMath.translate(m, -x, -y, -z);
    cameraMatrix = m;
}

//Test model.
//TODO: REMOVE.
var chest_model;
var chest_lines;
ModelHandler.load("lid", (model) => {
    chest_model = model;
    chest_lines = ModelHandler.triangleToLines(model);
});

//TODO: remove
export function test() {
    var test_v = [
        0, 0, 1,    1, 0, 1,    0, 1, 1,//Front -z
        1, 0, 1,    1, 1, 1,    0, 1, 1,

        0, 0, 0,    0, 0, 1,    0, 1, 0,//+x
        0, 0, 1,    0, 1, 1,    0, 1, 0,

        1, 0, 0,    0, 0, 0,    1, 1, 0,//Back +z
        0, 0, 0,    0, 1, 0,    1, 1, 0,

        1, 0, 1,    1, 0, 0,    1, 1, 1,//-x
        1, 0, 0,    1, 1, 0,    1, 1, 1,

        0, 1, 0,    0, 1, 1,    1, 1, 0,//Top
        1, 1, 0,    0, 1, 1,    1, 1, 1,

        0, 0, 0,    1, 0, 0,    0, 0, 1,//Bottom
        1, 0, 0,    1, 0, 1,    0, 0, 1,
    ];
    
    setCamera(0, -10, 6, 45, 0, 0);
    var m = MatrixMath.multiply(projectionMatrix, cameraMatrix);
    m = MatrixMath.translate(m, 0, 0, 0);
    m = MatrixMath.rotate(m, 0*Math.PI, 0.*Math.PI, 0*Math.PI);
    gl.uniformMatrix4fv(matrixLoc, false, m);
    render(chest_model, gl, vrtxPosBuffer);
    //var test_lines = ModelHandler.triangleToLines(test_v);
    render(chest_lines, gl, vrtxPosBuffer, true);
}


/**
 * Draws an object on screen
 * @param {*} object The object to draw
 * @param {function()} callback The function that gets called when the item is pressed
 */
export function draw(object, callback) {

}