/*
    This script keeps track of events, such as being given an item or moving, until the main loop are ready to deal with them.
    Mostly just wrappers for array functions.
*/

//The array that keeps track of unhandled events.
var event_queue = []

/**
 * Gets the oldest event, and removes it from the event queue.
 * @return {[String, Any]} An array consisting of the event id and event data.
 */
function get_event() {
    if (event_queue.length > 0) { 
        return event_queue.shift();
    }
    return [null, null];
}

/**
 * Checks whether there is at least one unhandled event.
 * @return {boolean}
 */
function has_event() {
    return (event_queue.length > 0);
}