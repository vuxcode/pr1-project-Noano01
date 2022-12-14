/*
    Loads models from file
*/

const vrtx_size = 3;

export function load(name) {
    
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

/**
 * Takes a bunch of triangular faces and returns the lines outlining them.
 * Automatically removes lines across bordering triangles, to allow for square surfaces.
 * @param {*} object The vertex data of the model.
 * @returns A table of verticies ready for rendering lines.
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