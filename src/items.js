/*
    Handles everything that has to do with items.
*/

import * as resourceLoader from "./resources.js";

//A list of all existing items. The items are represented by arrays.
const items = [];
//All the items the player owns. The items are represented by their IDs.
const inventory = [];
//The item in inventory that is currently selected;
var selected = 0;

//The amount of lines a single item uses in the text file.
const ITEM_WIDTH = 2;

//Load all the items from text file.
resourceLoader.loadResource("items", function(text) {
    //Split each line into a separate string
    var items_raw = text.replaceAll("\r", "").split("\n");
    //Iterate over induvidual items.
    for (let i = 0; i < items_raw.length; i+= ITEM_WIDTH) {
        //Adds an array to items.
        items.push([
            items_raw[i], //Containing the name
            items_raw[i+1] //and the description of the item.
        ]);
    }
});
console.log(items);

/**
 * Inserts an item into the players inventory.
 * @param {number} id The id of the item.
 */
export function giveItem(id) {
    inventory.push(id);
}

/**
 * Removes one or multiple items from inventory.
 * @param {number} id The id of the item to be removed
 * @param {number} amount The amount of items to remove. 0 deletes everything. 
 */
export function takeItem(id, amount = 0) {
    if (amount == 0) {
        amount = Infinity;
    }

    //Remove one item per loop until amount (left) becomes zero.
    for (;amount > 0; amount--) {
        //Find one item matching id
        const index = inventory.findIndex((element) => element == id);
        if (index == -1) {//If no matching item was found, exit the loop.
            break;
        }
        //Otherwise, remove item from inventory.
        inventory.splice(index,1);
    }
}

/**
 * Removes all items from inventory.
 */
export function clearInventory() {
    while (inventory.length > 0) {
        inventory.pop();
    }
}

/**
 * Gets the name of an item.
 * @param {number} id The id of the item.
 * @returns {string} The name of the item.
 */
export function getName(id) {
    return items[id][0];
}

/**
 * Gets the description of an item.
 * @param {number} id  The id of the item.
 * @returns {string} The description of the item.
 */
export function getDescription(id) {
    return items[id][1];
}

/**
 * Get the currently selected item.
 * @returns The item id.
 */
export function getItem() {
    return inventory[selected];
}

export function nextItem(clockwise = true) {
    //Increment (or decrement) the selection "pointer".
    if (clockwise) {
        selected++;
    } else {
        selected--;
    }
    //Make sure it is not out of bounds.
    selected = selected % inventory.length;
}