//The position of this vertex
attribute vec4 v_position;
//The position of the object this vertex belongs to.
//I will use this when I make this thing actually 3D
uniform vec4 o_position;

void main() {
    //This is the output variable
    gl_Position = v_position;
}
