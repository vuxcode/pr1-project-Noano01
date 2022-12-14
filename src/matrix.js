/*
    This script does matrix math for the renderer.
*/

/**
* Helper function to grab an element from a matrix
* @param {*} matrix The matrix
* @param {Number} x 
* @param {Number} y 
* @returns An function that returns elements from the matrix
*/
function makeFunction(matrix) {
    return (x,y) => {
        return matrix[y*4+x];
    };
}

/**
 * Multiply two matrices
 * @param {*} a 
 * @param {*} b 
 */
export function multiply(a,b) {
    if (a.length < 16 || b.length < 16) {
        console.log("ERROR: matrix to small!");
    }
    var a = makeFunction(a);
    var b = makeFunction(b);
    var out = [];
    //Multiply each element from column x in matrix a with each element from row y in matrix b. 
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
            var num = 0;
            //Loop through the rows/columns
            for (var i = 0; i < 4; i++) {
                num += b(i,y) * a(x,i);
            }
            out.push(num);
        }
    }
    return out;
}

export function identity() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

//This is orthographic. You probably want perspective
export function projection(width, height, depth) {
    return [
        1/width, 0, 0, 0,
        0, 1/height, 0, 0,
        0, 0, 1/depth, 0,
        0, 0, 0, 1,
    ];
}

export function perspective(fov, width, height, far) {
    var radFOV = (fov/180)*Math.PI;
    var field = Math.tan(Math.PI * 0.5 - 0.5 * radFOV);
    const near = 0.01;
    var range = 1/(near-far);
    var aspect = height/width;
    
    return [
        field, 0, 0, 0,
        0, field/aspect, 0, 0,
        0, 0, (near+far)*range, -1,
        0, 0, near*far*range*2, 0,
    ];
}

export function translation(x,y,z) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
    ];
}

export function translate(m,x,y, z) {
    return multiply(m, translation(x,y, z));
}

export function xRotation(rotation) {
    var c = Math.cos(rotation);
    var s = Math.sin(rotation);
    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
}

export function yRotation(rotation) {
    var c = Math.cos(rotation);
    var s = Math.sin(rotation);
    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
}

export function zRotation(rotation) {
    var c = Math.cos(rotation);
    var s = Math.sin(rotation);
    return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

export function rotateX(m,angle) {
    return multiply(m, xRotation(angle));
}

export function rotateY(m,angle) {
    return multiply(m, yRotation(angle));
}

export function rotateZ(m,angle) {
    return multiply(m, zRotation(angle));
}

export function rotate(m,x,y,z) {
    return rotateZ(rotateY(rotateX(m,x),y),z);
}

export function scaling(x,y,z) {
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1,
    ];
}

export function scale(m,x,y,z) {
    return multiply(m,scaling(x,y,z))
}