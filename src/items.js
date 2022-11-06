/*
    Handles everything that has to do with items.
*/

import * as resourceLoader from "./resources.js";

//A list of all existing items.
const items = [];
//All the items the player owns.
export const inventory = [];

//The amount of lines a single item uses in the text file.
const ITEM_WIDTH = 2;

//Load all the items from text file.
resourceLoader.loadResource("items", function(text) {
    //Split each line into a separate string
    var items_raw = text.replaceAll("\r", "").split("\n");
    //Iterate over induvidual items.
    for (let i = 0; i < items_raw.length; i+= ITEM_WIDTH) {
        //Adds an table to items.
        items.push([
            items_raw[i], //Containing the name
            items_raw[i+1] //and the description of the item.
        ]);
    }
});
console.log(items);

export function giveItem(id) {

}

export function takeItem(index) {

}

export function clearInventory() {

}