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
        return matrix[y*3+x];
    };
}

/**
 * Multiply two matrices
 * @param {*} a 
 * @param {*} b 
 */
export function multiply(a,b) {
    var a = makeFunction(a);
    var b = makeFunction(b);
    var out = [];
    for (var y = 0; y < 3; y++) {
        for (var x = 0; x < 3; x++) {
            out.push( //Multiply each element from column x in matrix a with each element from row y in matrix b. 
                b(0,y) * a(x,0) + b(1,y) * a(x,1) + b(2,y) * a(x,2)
            )
        }
    }
    return out;
}

export function identity() {
    return [
        1,0,0,
        0,1,0,
        0,0,1,
    ];
}

export function translation(x,y) {
    return [
        1, 0, 0,
        0, 1, 0,
        x, y, 1,
    ];
}

export function translate(m,x,y) {
    return multiply(m, translation(x,y));
}

/**
 * Creates an rotation matrix
 * @param {Number} z The angle in radians aroudn z axis.
 */
export function rotation(z) {
    var z_c = Math.cos(z);
    var z_s = Math.sin(z);
    return [
        z_c, -z_s, 0,
        z_s, z_c, 0,
        0, 0, 1,
    ];
}

export function rotate(m,z) {
    return multiply(m, rotation(z));
}