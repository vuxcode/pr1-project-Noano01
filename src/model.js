/*
    Loads models from file
*/

import * as ResourceHandler from "./resources.js";

const vrtx_size = 3;

/**
 * Loads a model from an .obj file.
 * The result is returned by a callback function
 * @param {string} name The name of the model, without ".obj"
 * @param {function(table)} callback 
 */
export function load(name, callback) {
    ResourceHandler.loadResource("models/"+name+".obj", (text) => {
        var lines = text.replace("\r", "").split("\n");
        var vertices = [];
        var out = [];
        for (const line in lines) {
            switch (lines[line].charAt(0)) {
                case "v":
                    vertices.push(lines[line].slice(2));
                    break;
                case "f":
                    var face = lines[line].slice(2).split(" ");
                    for (const vertex in face) {
                        const v =  vertices[face[vertex]-1].split(" ");
                        for (const num in v) {
                            out.push(Number(v[num]));
                        }
                    }
                    break;
            }
        }
        setTimeout(callback, 0, out);
    });
}

/**
 * Takes three points in a triangle and returns their normal.
 * The points should be counter clockwise.
 */
function normal(p1,p2,p3) {
    console.log(p1,p2,p3);
    var Ax = p2[0]-p1[0];
    var Ay = p2[1]-p1[1];
    var Az = p2[2]-p1[2];
    var Bx = p3[0]-p1[0];
    var By = p3[1]-p1[1];
    var Bz = p3[2]-p1[2];
    var out =  [
        Ay * Bz - Az * By,
        Az * Bx - Ax * Bz,
        Ax * By - Ay * Bx,
    ];
    var mag = Math.sqrt(out[0]**2+out[1]**2+out[2]**2);
    out[0] = out[0]/mag;
    out[1] = out[1]/mag;
    out[2] = out[2]/mag;
    console.log(mag);
    console.log(out);
    return out;
}

function isClose(a,b) {
    var dif = Math.abs(a-b);
    if (dif <= 0.001) {
        return true;
    }
    return false;
}

/**
 * Takes a bunch of triangular faces and returns the lines outlining them.
 * Automatically removes lines across bordering triangles, to allow for square surfaces.
 * @param {*} object The vertex data of the model.
 * @returns A table of vertices ready for rendering lines.
 */
export function triangleToLines(object) {
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
    var duplicates = [];
    const loop_step = 2*vrtx_size;
    for (var i = 0; i < out.length; i+=loop_step) {
        var i2 = (i/loop_step);
        var n1 = norms[i2];
        check_dup: for (var j = i+loop_step; j < out.length; j+= loop_step) {
            for (var k = 0; k < vrtx_size; k++) {
                if (out[i+k] != out[j+vrtx_size+k] || out[j+k] != out[i+vrtx_size+k]) {
                    continue check_dup;
                }
            }
            //Found overlap
            var j2 = (j/loop_step);
            var n2 = norms[j2];
            if (!isClose(n1[0], n2[0]) || !isClose(n1[1], n2[1]) || !isClose(n1[2], n2[2])) {
                continue check_dup;
            }
            //Overlap is duplicate!
            if (!duplicates.includes(i)) {
                duplicates.push(i);
            }
            if (!duplicates.includes(j)) {
                duplicates.push(j);
            }
            
        }
    }
    //Remove duplicates
    duplicates.sort((a, b) => {//Inverted sort function to sort backwards.
        if (a<b) {
            return 1;
        }
        if (b<a) {
            return -1;
        }
        return 0;
    });
    for (var i = 0; i < duplicates.length; i++) {
        out.splice(duplicates[i],2*vrtx_size)
    }
    console.log(duplicates);
    return out;
}

/**
 * Returns an array, and fills it with model and triangle data when done.
 * @param {*} name The name of the model without ".obj"
 */
export function getModel(name) {
    var out = [];
    load(name, (model) => {
        out.push(model);
        out.push(triangleToLines(model));
    })
    return out;
}