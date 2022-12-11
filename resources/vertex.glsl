//The position of this vertex
attribute vec4 a_position;
//The size of the screen
uniform vec2 u_resolution;
//The position of the object this vertex belongs to.
//I will use this when I make this thing actually 3D
uniform vec4 u_translation;

void main() {
    vec2 scaledPosition = vec2(a_position.x/u_resolution.x, a_position.y/u_resolution.y);
    //This is the output variable
    gl_Position = vec4(scaledPosition, 0, 1);
}
