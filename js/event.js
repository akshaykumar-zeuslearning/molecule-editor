import { ToolEventHandler } from './tool-event-handler.js';
import { tools } from './tools.js';

class Event {
    constructor(editor) {
        this.editor = editor;
        this.eventHandler = new ToolEventHandler();
        this.initialize(this.editor.tools);
    }

    initialize(tools) {
        tools.forEach((tool) => {
            const toolElement = document.getElementById(tool.id);
            if (toolElement) {
                this.eventHandler.setupToolEvents(tool, toolElement);
                tool.actions.forEach((action) => {
                    this.eventHandler.addEventListener(tool.id, action.name, () => {
                        if (typeof window[action.callback] === 'function') {
                            console.log('working');
                            this.editor[action.callback]();
                        } else {
                            console.warn(`Callback function ${action.callback} not found`);
                        }
                    });
                });
            }
        });
    }
}

export default Event;
