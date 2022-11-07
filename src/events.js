/*
    This script keeps track of events, such as being given an item or moving, until the main loop are ready to deal with them.
    Mostly just wrappers for array functions.
*/

//The array that keeps track of unhandled events.
const event_queue = [];

/**
 * Gets the oldest event, and removes it from the event queue.
 * @return {[String, Any]} An array consisting of the event id and event data.
 */
export function pullEvent() {
    if (event_queue.length > 0) { 
        return event_queue.shift();
    }
    return [null, null];
}

/**
 * Checks whether there is at least one unhandled event.
 * @return {boolean}
 */
export function hasEvent() {
    return (event_queue.length > 0);
}

/**
 * Adds an event to the event queue.
 * @param {string} id The id of the event.
 * @param {Any} data Any data the event contains.
 */
export function pushEvent(id, data) {
    event_queue.push([id, data]);
}