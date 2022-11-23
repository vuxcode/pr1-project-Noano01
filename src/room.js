/*
    Keeps track of all the rooms, and which room the player is in.
*/

//All available rooms. May not be changed.
const rooms = [];
//Which room the player is in.
var player = 0;
//Which direction the player is facing/what position the player has.
//The variable is an index, the actual directions/positions are defined per room.
var rotation = 0;

/**
 * Move the player character to another room.
 * @param {number} id The id of the room.
 */
export function move(id);

/**
 * Change position/rotation in the room.
 * @param {number} id The id of the position/rotation you "turn" to.
 */
export function turn(id);

export function getRoom() {
    return rooms[player];
}

export function renderRoom(room);

function renderRoomMap(id, x, y);

export function renderMap();