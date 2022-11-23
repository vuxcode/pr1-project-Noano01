/*
    Keeps track of the state of the game. For example, whether a door is open or not.
*/

var data = {};

export function clear() {
    data = {};
}

export function get(key) {
    return data[key];
}

export function set(key, value) {
    data[key] = value;
    return value;
}

export function getOrSet(key, value) {
    if (data[key]) {
        return data[key];
    }
    return set(key, value);
}