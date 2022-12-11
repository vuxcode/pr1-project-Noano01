//The position of this vertex
attribute vec2 a_position;
//The size of the screen
uniform vec2 u_resolution;
//An matrix containing describing the position of the object this vertex belongs to
uniform mat3 u_matrix;

void main() {
    vec2 position = (u_matrix * vec3(a_position, 1)).xy;
    vec2 scaledPosition = position/u_resolution;
    //This is the output variable
    gl_Position = vec4(scaledPosition, 0, 1);
}
