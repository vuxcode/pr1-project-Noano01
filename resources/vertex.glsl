//The position of this vertex
attribute vec4 v_position;
//The position of the object this vertex belongs to
uniform vec4 o_position;
//Wheather or not this is supposed to draw squares.
//Avoids an ugly diagonal line over square surfaces.
uniform bool squareish;

void main() {
    //This is the output variable
    gl_Position = v_position;
}
