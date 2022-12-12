/*
    Renders things to screen.
*/

import * as ResourceHandler from "./resources.js";
import * as MatrixMath from "./matrix.js";

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

    gl.uniform2f(resolutionLoc, canvas.clientWidth, canvas.clientHeight);

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

/**
 * Takes three points in a triangle and returns their normal.
 * The points should be counter clockwise.
 */
function normal(p1,p2,p3) {
    var Ax = p2[0]-p1[0];
    var Ay = p2[1]-p1[1];
    var Az = p2[2]-p1[2];
    var Bx = p3[0]-p1[0];
    var By = p3[1]-p1[1];
    var Bz = p3[2]-p1[2];
    return [
        Ay * Bz - Az * By,
        Az * Bx - Ax * Bz,
        Ax * By - Ay * Bx,
    ];
}

//This should probably be in the part where objects are loaded, to increase performance
function triangleToLines(object) {
    var out = [];
    var norms = [];
    for (var i = 0; i < object.length; i+=3*vrtx_size) {
        var n = normal(
            [object[i],object[i+1], object[i+2]],
            [object[i+3], object[i+4], object[i+5]], 
            [object[i+6], object[i+7], object[i+8]]);
        norms.push(n, n, n);
        for (var j = 0; j < 3; j++) {
            var k = j*vrtx_size;//The offset from the first part of the triangle
            var max = vrtx_size*3;
            out.push(object[ i + ( k    %max) ], 
                     object[ i + ((k+1) %max) ],
                     object[ i + ((k+2) %max) ],
                     object[ i + ((k+3) %max) ],
                     object[ i + ((k+4) %max) ],
                     object[ i + ((k+5) %max) ],
                     );
        }
    }
    //Check for duplicates.
    var loop_step = 2*vrtx_size
    for (var i = 0; i < out.length; i+=loop_step) {
        check_dup: for (var j = i+loop_step; j < out.length; j+= loop_step) {
            for (var k = 0; k < vrtx_size; k++) {
                if (out[i+k] != out[j+vrtx_size+k] || out[j+k] != out[i+vrtx_size+k]) {
                    continue check_dup;
                }
            }
            //Found overlap
            var i2 = (i/loop_step);
            var j2 = (j/loop_step);
            var n1 = norms[i2];
            var n2 = norms[j2];
            if (n1[0] != n2[0] || n1[1] != n2[1] || n1[2] != n2[2]) {
                continue check_dup;
            }
            //Overlap is duplicate!
            out.splice(j,2*vrtx_size);
            out.splice(i,2*vrtx_size);
            norms.splice(j2,1);
            norms.splice(i2, 1);
        }
    }
    return out;
}

//TODO: remove
export function test() {
    var test_v = [
        0, 0, 0,        500, 0, 0,      0, 500, 0,
        0, 0, 500,      0, 0, 0,        0, 500, 0,
        500, 0, 0,      0, 0, 500,      0, 500, 0,
        0, 0, 0,        0, 0, 500,      500, 0, 0,
    ];
    var m = MatrixMath.translate(projectionMatrix, 0, 0, -2000);
    m = MatrixMath.rotate(m, 0.1*Math.PI, -0.25*Math.PI, 0*Math.PI);
    gl.uniformMatrix4fv(matrixLoc, false, m);
    render(test_v, gl, vrtxPosBuffer);
    render(triangleToLines(test_v), gl, vrtxPosBuffer, true);
}


/**
 * Draws an object on screen
 * @param {*} object The object to draw
 * @param {function()} callback The function that gets called when the item is pressed
 */
export function draw(object, callback) {

}