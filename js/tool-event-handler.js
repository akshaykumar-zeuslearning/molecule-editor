export class ToolEventHandler {
    constructor() {
        this.events = {};
    }

    addEventListener(toolId, eventType, callback) {
        if (!this.events[toolId]) {
            this.events[toolId] = {};
        }
        if (!this.events[toolId][eventType]) {
            this.events[toolId][eventType] = [];
        }
        this.events[toolId][eventType].push(callback);
    }

    removeEventListener(toolId, eventType, callback) {
        if (this.events[toolId] && this.events[toolId][eventType]) {
            this.events[toolId][eventType] = this.events[toolId][eventType].filter(
                (cb) => cb !== callback
            );
        }
    }

    dispatchEvent(toolId, eventType, ...args) {
        if (this.events[toolId] && this.events[toolId][eventType]) {
            this.events[toolId][eventType].forEach((callback) => {
                callback(...args);
            });
        }
    }

    setupToolEvents(tool, targetElement) {
        tool.actions.forEach((action) => {
            targetElement.addEventListener(action.name, (event) => {
                this.dispatchEvent(tool.id, action.name, event);
            });
        });
    }
}
