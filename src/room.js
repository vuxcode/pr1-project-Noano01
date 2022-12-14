/*
    Keeps track of all the rooms, and which room the player is in.

    A room = [objects, walls]
    An object = [exists, position, model, click events]
*/

import * as RenderHandler from "./render.js";
import * as StateHandler from "./state.js";
import * as ModelHandler from "./model.js";
import * as MessageHandler from "./messages.js";

const right = document.getElementById("turn_right");
const left = document.getElementById("turn_left");

right.onclick = () => {
    turn(true);
}
left.onclick = () => {
    turn(false);
}


//All available rooms.
const rooms = [
    [//The first room
        [//The walls
            [//The only wall in this room
                ModelHandler.getModel("cube"),
                [0, 1, 0, 0, 0, 0, 3, 2, 3]
            ],
        ],
        [//The objects in the room
            [//This room is simple, it will only contain a single chest
                ["boolean", true],//it is always visible
                ModelHandler.getModel("chest"),
                [0, 0, -1.5, 0, 0, 0, 0.25, 0.25, 0.25,],
                ()=> {
                    if (!StateHandler.getOrSet("chest_opened", false)) {
                        MessageHandler.showMessage("A closed wooden chest.", () => {
                            MessageHandler.askBool("Do you want to open it?", (answer) => {
                                StateHandler.set("chest_opened", answer)
                                MessageHandler.exit();
                            });
                        });
                    }
                }
            ],
            [//A lid for the chest
            ["inverted", "chest_opened", true], // It will be visible when "chest_opened" isn't true, and default to true
            ModelHandler.getModel("lid"),
            [0, 0, -1.5, 0, 0, 0, 0.25, 0.25, 0.25,],
            ()=> {
                MessageHandler.showMessage("A closed wooden chest.", () => {
                    MessageHandler.askBool("Do you want to open it?", (answer) => {
                        StateHandler.set("chest_opened", answer)
                        MessageHandler.exit();
                    });
                });
            }
            ],
            [//An open lid
            ["state", "chest_opened", false],
            ModelHandler.getModel("lid"),
            [0, 0.25, -1.4, -45, 0, 0, 0.25, 0.25, 0.25,],
            false
            ],
            [//An key!
            ["and", ["state", "chest_opened", false], ["state", "key_exist", true]],
            ModelHandler.getModel("key"),
            [0, 0.3, -1.3, 45, -90, 0, 0.3, 0.3, 0.3,],
            ()=> {
                StateHandler.set("has_key", true);
                StateHandler.set("key_exist", false);
                MessageHandler.showMessage("You found a key!");
            }
            ],
        ]
    ],
];



//Which room the player is in.
var player = 0;
//Which direction the player is facing
var view = 0;

/**
 * Move the player character to another room.
 * @param {number} id The id of the room.
 */
export function move(id) {
    player = id;
    view = 0;
}

/**
 * Change position/rotation in the room.
 * @param {boolean} dir Turn right(true) or left(false);
 */
export function turn(dir = true) {
    if (dir) {
        view -= 90
    } else {
        view += 90;
    }
    RenderHandler.setCamera(0,1,0,0,view,0);
}
RenderHandler.setCamera(0,1,0,0,0,0);

/**
 * Check if object should be rendered
 * @param {*} cond 
 */
function shouldRender(cond) {
    switch (cond[0]) {
        case "boolean":
            return cond[1];
        case "state":
            return StateHandler.getOrSet(cond[1], cond[2]);
        case "inverted":
            return !StateHandler.getOrSet(cond[1], !cond[2]);
        case "and":
            return shouldRender(cond[1]) && shouldRender(cond[2]);
    }
}

export function renderRoom() {
    //Draw the walls
    for (const i in rooms[player][0]) {
        RenderHandler.draw(rooms[player][0][i][0], rooms[player][0][i][1], false, false);
    }
    //Draw the objects
    for (const i in rooms[player][1]) {
        if (shouldRender(rooms[player][1][i][0])) {
            RenderHandler.draw(rooms[player][1][i][1], rooms[player][1][i][2], rooms[player][1][i][3]);
        }
    }
}

