/*
    This script is the main one, where the main loop resides and everything else is called from.
*/

//Remove the module error message if this is running correctly.
document.getElementById("module_message").remove();

import * as Renderer from "./render.js";
import * as MessageHandler from "./messages.js";
import * as RoomHandler from "./room.js";

//This keeps track of the current time so the main loop knows how much time has passed.
var loop_time = Date.now();
//How many times per second the loop should run.
const frames_per_second = 30;
//Exactly how much time that is in miliseconds, to simplify later calculations.
const wait_time = 1000/frames_per_second;

function main() {
    //Check how much time (delta) has passed since last loop.
    var new_time = Date.now();
    var delta = loop_time - new_time;
    loop_time = new_time;

    if (Renderer.hasFinished()) {
        Renderer.prepareRender();
        //Renderer.test();
        RoomHandler.renderRoom();
    }
    
    //TODO: the rest of the game.

    //Wait before calling the loop again.
    //Subtracts time elapsed to ensure constant interval regardles of how long the function took.
    setTimeout(main, wait_time-(Date.now()-loop_time));
}

Renderer.setupShaders();
//Start the loop.
main();