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
            [//A key!
            ["and", ["state", "chest_opened", false], ["state", "key_exist", true]],
            ModelHandler.getModel("key"),
            [0, 0.3, -1.3, 45, -90, 0, 0.3, 0.3, 0.3,],
            ()=> {
                StateHandler.set("has_key", true);
                StateHandler.set("key_exist", false);
                MessageHandler.showMessage("You found a key!");
            }
            ],
            [//The door frame
            ["boolean", true],
            ModelHandler.getModel("door_frame"),
            [0, -0.1, 1.5, 0, 180, 0, 0.4, 0.4, 0.25,],
            false
            ],
            [//Decorative door
            ["state", "door_open", false],
            ModelHandler.getModel("door"),
            [0, -0.1, 1.7, 0, 180, 0, 0.4, 0.4, 0.25,],
            false,
            ],
            [//The door
            ["inverted", "door_open", true],
            ModelHandler.getModel("door"),
            [0, -0.1, 1.4, 0, 180, 0, 0.4, 0.4, 0.25,],
            ()=> {
                MessageHandler.showMessage("A locked wooden door.", () => {
                    if (StateHandler.getOrSet("has_key", false)) {
                        MessageHandler.askBool("Use the key you found to open it?", (answer) => {
                            if (answer) {
                                StateHandler.set("door_open", true)
                                MessageHandler.showMessage("You step through the door...")
                                StateHandler.clear();
                                move(1);
                            } else {
                                MessageHandler.exit();
                            }
                        });
                    } else {
                        MessageHandler.exit();
                    }
                });
            }
            ],
        ]
    ],
    [//The second room
        [//The walls
            [//The only wall in this room
            ModelHandler.getModel("cube"),
            [0, 1, 0, 0, 0, 0, 3, 2, 3]
        ],
    ],
    [//The objects in the room
        
        [//The door frame
        ["boolean", true],
        ModelHandler.getModel("door_frame"),
        [0, -0.1, 1.5, 0, 180, 0, 0.4, 0.4, 0.25,],
        false
        ],
        [//Decorative door
        ["state", "door_open", false],
        ModelHandler.getModel("door"),
        [0, -0.1, 1.7, 0, 180, 0, 0.4, 0.4, 0.25,],
        false,
        ],
        [//The door
        ["inverted", "door_open", true],
        ModelHandler.getModel("door"),
        [0, -0.1, 1.4, 0, 180, 0, 0.4, 0.4, 0.25,],
        ()=> {
            MessageHandler.showMessage("A locked wooden door.", () => {
                if (StateHandler.getOrSet("has_key", false)) {
                    MessageHandler.askBool("Use the key you found to open it?", (answer) => {
                        if (answer) {
                            StateHandler.set("door_open", true);
                            MessageHandler.showMessage("You step through the door...")
                            StateHandler.clear();
                            move(2);
                        } else {
                            MessageHandler.exit();
                        }
                    });
                } else {
                    MessageHandler.exit();
                }
            });
        }
        ],
        [//A flowerpot
        ["boolean", true],
        ModelHandler.getModel("plant"),
        [1, 0, -1.4, 0, 0, 0, 0.25, 0.25, 0.25,],
        () => {
            if (StateHandler.getOrSet("has_key", false)) {
                MessageHandler.showMessages(["A pot with some kind of plant.", "You previously found a key here."]);
            } else {
                StateHandler.set("has_key", true); 
                MessageHandler.showMessages(["You spot a plant in the corner.",
                "The plant seems pretty irrelevant.",
                "But wait! There is something glinting in the dirt!",
                "You found a key!"]);
            }
        }
        ],
        [//A bookcase
        ["boolean", true],
        ModelHandler.getModel("books"),
        [-0.9, 0, -1.5, 0, 0, 0, 0.5, 0.5, 0.25,],
        () => {
            MessageHandler.showMessage("You rifle through the bookcase, but find nothing of interest.");
        }
        ],
    ]
    ],
    [//The third room
        [//The walls
            [//The only wall in this room
            ModelHandler.getModel("cube"),
            [0, 1, 0, 0, 0, 0, 3, 2, 3]
        ],
    ],
    [//The objects in the room
        [//The door frame
        ["boolean", true],
        ModelHandler.getModel("door_frame"),
        [0, -0.1, 1.5, 0, 180, 0, 0.4, 0.4, 0.25,],
        false
        ],
        [//Decorative door
        ["state", "door_open", false],
        ModelHandler.getModel("door"),
        [0, -0.1, 1.7, 0, 180, 0, 0.4, 0.4, 0.25,],
        false,
        ],
        [//The door
        ["inverted", "door_open", true],
        ModelHandler.getModel("door"),
        [0, -0.1, 1.4, 0, 180, 0, 0.4, 0.4, 0.25,],
        ()=> {
            MessageHandler.showMessage("A locked wooden door.", () => {
                if (StateHandler.getOrSet("has_key", false)) {
                    MessageHandler.askBool("Use the key you found to open it?", (answer) => {
                        if (answer) {
                            StateHandler.set("door_open", true);
                            MessageHandler.showMessages(["You step through the door...", "Congrats! You beat the game."], () => {
                                MessageHandler.askBool("Play again?", (answer2) => {
                                    if (answer2) {
                                        MessageHandler.exit();
                                        move(0);
                                    } else {
                                        document.body.remove();
                                    }
                                });
                            })
                            StateHandler.clear();
                        } else {
                            MessageHandler.exit();
                        }
                    });
                } else {
                    MessageHandler.exit();
                }
            });
        }
        ],
        [//A flowerpot
        ["boolean", true],
        ModelHandler.getModel("plant"),
        [-1, 0, -1.4, 0, 90, 0, 0.25, 0.25, 0.25,],
        () => {
            MessageHandler.showMessages(["There is a pot in the corner, containing what looks to be some kind of plant.",
                                        "It doesn't look useful."]);
        }
        ],
        [//A messy bookcase
        ["inverted", "has_key", true],
        ModelHandler.getModel("messy_books"),
        [0.9, 0, -1.5, 0, 0, 0, 0.5, 0.5, 0.25,],
        () => {
            MessageHandler.showMessages(["A bookcase full of haphazardly placed books.",
                                        "You try to arrange the books a bit more neatly.",
                                        "But wait... What is this?",
                                        "You found a key!"
            ], () => {
                StateHandler.set("has_key", true)
                MessageHandler.exit();
            });
        }
        ],
        [//A tidy bookcase
        ["state", "has_key", false],
        ModelHandler.getModel("books"),
        [0.9, 0, -1.5, 0, 0, 0, 0.5, 0.5, 0.25,],
        () => {
            MessageHandler.showMessage("A rather nicely arranged bookshelf.")
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
    RenderHandler.setCamera(0,1,0,0,0,0);
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
    view = view%360;
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

