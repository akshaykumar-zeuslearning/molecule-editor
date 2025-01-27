import { getIconByKey } from "./icons.js";
import Tool from './tool.js';

export const tools = [
    new Tool("pencil-tool", 'pencil', "pencil-tool active", "Draw", getIconByKey("pencil"), [
        { name: "mousedown", callback: "drawActionOnMouseDown" },
        { name: "mousemove", callback: "drawActionOnMouseMove" },
        { name: "mouseup", callback: "drawActionOnMouseUp" }
    ], this),
    new Tool("eraser-tool", 'eraser', "eraser-tool", "Erase", getIconByKey("eraser"), [
        { name: "mousedown", callback: "eraseActionOnMouseDown" },
        { name: "mousemove", callback: "eraseActionOnMouseMove" }
    ], this),
    new Tool("move-tool", 'move', "move-tool", "Move", getIconByKey("move"), [
        { name: "mousedown", callback: "moveActionOnMouseDown" },
        { name: "mousemove", callback: "moveActionOnMouseMove" },
        { name: "mouseup", callback: "moveActionOnMouseUp" },
        { name: "mouseenter", callback: "moveActionOnMouseEnter" },
        { name: "mouseleave", callback: "moveActionOnMouseLeave" }
    ], this),
    new Tool("undo-tool", 'undo',"undo-tool", "Undo", getIconByKey("undo"), [
        { name: "click", callback: "undoActionOnClick" }
    ], this),
    new Tool("redo-tool", 'redo', "redo-tool", "Redo", getIconByKey("redo"), [
        { name: "click", callback: "redoActionOnClick" }
    ], this),
    new Tool("clear-all-tool", 'clear-all', "clear-all-tool", "Clear all", getIconByKey("delete"), [
        { name: "click", callback: "clearAllActionOnClick" }
    ], this),
    new Tool("save-tool", 'save', "save-tool", "Save", getIconByKey("download"), [
        { name: "click", callback: "saveActionOnClick" }
    ], this),
    new Tool("load-tool", 'load', "load-tool", "Load", getIconByKey("upload"), [
        { name: "click", callback: "loadActionOnClick" }
    ], this),
];

