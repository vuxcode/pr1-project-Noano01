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
var click_program;

//The location of various shader uniforms
var colorLoc;
var matrixLoc;

var vrtxPosLoc;
var vrtxPosBuffer;

//Clcik canvas too
var click_colorLoc;
var click_matrixLoc;

var click_vrtxPosLoc;
var click_vrtxPosBuffer;

//The amount of dimensions each vector has. DO NOT CHANGE.
const vrtx_size = 3;

var projectionMatrix = MatrixMath.perspective(110, canvas.clientWidth, canvas.clientHeight, 10000);
var cameraMatrix = MatrixMath.identity();

var has_initialized = false;

//The next id click funciton should use.
var next_id = 0;
var click_events = [];
var queued_events = [];

export function hasFinished() {
    return has_initialized;
}

/**
 * Clear everything from the screen.
 */
export function clear() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    click_gl.clearColor(0, 0, 0, 0);
    click_gl.clear(click_gl.COLOR_BUFFER_BIT | click_gl.DEPTH_BUFFER_BIT);
    next_id = 0;
    click_events = [];
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
        if (context.getShaderParameter(shader, context.COMPILE_STATUS)) {
            setTimeout(callback, 0, shader);
            return;
        }
        //Provide log and delete shader, in case of error.
        console.log(context.getShaderInfoLog(shader));
        context.deleteShader(shader);
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
    var p = context.createProgram();
    //Attach the shaders to the program.
    context.attachShader(p, vertex);
    context.attachShader(p, fragment);
    context.linkProgram(p);
    //Check if successful.
    if (context.getProgramParameter(p, context.LINK_STATUS)) {
        return p;
    }
    //Provide log and delete program, in case of error.
    console.log(context.getProgramInfoLog(p));
    context.deleteProgram(p);
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
            //The click canvas too
            compileShader(click_gl, click_gl.VERTEX_SHADER, "vertex.glsl", (v_shader) => {
                compileShader(click_gl, click_gl.FRAGMENT_SHADER, "fragment.glsl", (f_shader) => {
                    //Put togetther the shaders
                    click_program = createProgram(click_gl, v_shader, f_shader);
                    //Get where to put the vertices and stuff
                    click_colorLoc = click_gl.getUniformLocation(click_program, "u_color");
                    click_matrixLoc = click_gl.getUniformLocation(click_program, "u_matrix");

                    click_vrtxPosLoc = click_gl.getAttribLocation(click_program, "a_position");
                    click_vrtxPosBuffer = click_gl.createBuffer();
                    console.log("Click Shader loaded successfully!");
                    has_initialized = true;
                });
            });
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
    click_gl.useProgram(click_program);
    resizeScreen();
    clear();

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enableVertexAttribArray(vrtxPosLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vrtxPosBuffer);
    gl.vertexAttribPointer(vrtxPosLoc, vrtx_size, gl.FLOAT, false, 0, 0);

    click_gl.enable(click_gl.CULL_FACE);
    click_gl.enable(click_gl.DEPTH_TEST);
    click_gl.enableVertexAttribArray(click_vrtxPosLoc);
    click_gl.bindBuffer(click_gl.ARRAY_BUFFER, click_vrtxPosBuffer);
    click_gl.vertexAttribPointer(click_vrtxPosLoc, vrtx_size, click_gl.FLOAT, false, 0, 0);

    requestAnimationFrame(handleEvents);
}

/**
 * Draw object to context
 * @param {Number[]} object 
 * @param {*} context 
 * @param {*} buffer
 */
function render(object, context, buffer, wireframe = false, click = false) {
    //Bind buffer to write to it. This might be redundant.
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    //Write vertices to buffer
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(object), context.DYNAMIC_DRAW);
    //Draw every vertex.
    if (wireframe) {
        context.uniform4f(colorLoc,  1, 1, 1, 1); 
        context.drawArrays(context.LINES, 0, object.length/vrtx_size);
    } else {
        if (!click) {
            context.uniform4f(colorLoc,  0, 0, 0, 0); 
        };
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
var wall_model;
var wall_lines;
ModelHandler.load("cube", (model) => {
    wall_model = model;
    wall_lines = ModelHandler.triangleToLines(model);
});
var chest_model;
var chest_lines;
ModelHandler.load("books", (model) => {
    chest_model = model;
    chest_lines = ModelHandler.triangleToLines(model);
});
var lid_model;
var lid_lines;
ModelHandler.load("plant", (model) => {
    lid_model = model;
    lid_lines = ModelHandler.triangleToLines(model);
});

//TODO: remove
export function test() {
    setCamera(2, 2, 6, -30, 10, 0);
    draw([wall_model,wall_lines], [0,5,0,0,0,0,20,10,20], false, false);
    draw([chest_model,chest_lines], [0,0,0,0,0,0,1,1,1], () => {
        console.log("HELLO");
    });
    draw([lid_model,lid_lines], [2,0,0,0,0,0,.5,0.5,0.5], () => {
        console.log("WORLD");
    });
}

function intToColor(num) {
    var num = num*16;
    return [
        (num%256)/256,
        Math.floor((num%(256*256))/256)/256,
        Math.floor(num/(256*256))/256,
        1
    ];
}

function colorToInt(color) {
    var c = color[0];
    c += color[1]*256;
    c += color[2]*256*256;
    return c/16;
}

/**
 * Draws an object on screen
 * @param {*} object An array containing the model and the triangle data for the object.
 * @param {*} position An array containing the position, rotation, and scale of the object.
 * @param {function()} callback The function that gets called when the item is pressed
 * @param {boolean} faces Whether or not the faces of the object should be drawn
 */
export function draw(object, position, callback = null, faces=true) {
    var matrix = MatrixMath.multiply(projectionMatrix, cameraMatrix);
    matrix = MatrixMath.translate(matrix, position[0], position[1], position[2]);
    matrix = MatrixMath.rotate(matrix, degToRad(position[3]), degToRad(position[4]), degToRad(position[5]));
    matrix = MatrixMath.scale(matrix, position[6], position[7], position[8])
    gl.uniformMatrix4fv(matrixLoc, false, matrix);
    if (faces) {
        render(object[0], gl, vrtxPosBuffer, false);
    }
    render(object[1], gl, vrtxPosBuffer, true);
    //Render on click canvas
    if (callback) {
        click_events.push(callback);
        click_gl.uniformMatrix4fv(click_matrixLoc, false, matrix);
        click_gl.uniform4fv(click_colorLoc, intToColor(next_id));
        next_id++;
        render(object[0], click_gl, click_vrtxPosBuffer, false, true);
    }
}


canvas.onclick = (event) => {
    queued_events.push([event.offsetX, event.offsetY]);
}

function handleEvents() {
    if (queued_events.length == 0) {return;}
    for (var i = 0; i < queued_events.length; i++) {
        var x = queued_events[i][0];
        var y = canvas.clientHeight - queued_events[i][1];

        var pixels = new Uint8Array(4);
        click_gl.readPixels(x, y, 1, 1, click_gl.RGBA, click_gl.UNSIGNED_BYTE, pixels);
        if (pixels[3] > 0) {
            var id = colorToInt(pixels);
            setTimeout(click_events[id],0);
        }
    }
    queued_events = [];
}