class Tool {
    constructor(id, name, className, title, icon, actions, editor) {
        this.id = id;
        this.className = className;
        this.title = title;
        this.icon = icon;
        this.actions = actions;
        this.name = name.toLowerCase();
        this.isActive = false;
        this.editor = editor;
    }

    // Method to register a custom event listener for each tool's action
    addActionListener(toolEventHandler, editor) {
        const toolElement = editor.canvas;
        if (toolElement) {
            toolEventHandler.setupToolEvents(this, toolElement);

            this.actions.forEach((action) => {
                toolEventHandler.addEventListener(this.id, action.name, (e) => {
                    if (typeof editor[action.callback] === 'function') {
                        editor[action.callback](e);
                    } else {
                        console.warn(`Callback function ${action.callback} not found`);
                    }
                });
            });
        }
        // const button = editor.editorContainer.querySelector(`#${this.id}`);
        // if (button) {
        //     button.addEventListener("click", () => {
        //         console.log("Tool clicked");
        //         editor.editorContainer.dispatchEvent(
        //             new CustomEvent("toolClick", {
        //                 tool: this,
        //                 editor: editor,
        //             })
        //         );
        //     });
        // }
    }

    addEventListeners() {
        const toolElement = this.editor.canvas;
        if (toolElement) {
            this.actions.forEach((action) => {
                toolElement.addEventListener(action.name, (event) => {
                    const callbackFunction = this.editor[action.callback];
                    if (typeof callbackFunction === 'function') {
                        callbackFunction.call(this.editor, event);
                    } else {
                        console.warn(`Callback function ${action.callback} not found`);
                    }
                });
            });
        }
    }

    removeEventListeners() {
        const toolElement = this.editor.canvas;
        if (toolElement) {
            this.actions.forEach((action) => {
                toolElement.removeEventListener(this.id, action.name, (event) => {
                    const callbackFunction = this.editor[action.callback];
                    if (typeof callbackFunction === 'function') {
                        callbackFunction.call(this.editor, event);
                    }
                });
            });
        }
    }

    setActive(isActive) {
        this.isActive = isActive;

        // Add or remove event listeners based on the tool's active state
        if (isActive) {
            this.addEventListeners();
        } else {
            this.removeEventListeners();
        }
    }
}

export default Tool;
