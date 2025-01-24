import { ToolEventHandler } from "./tool-event-handler.js";

class ToolManager {
    constructor(editor) {
        this.editor = editor;
        this.tools = editor.tools;
        this.toolEventHandler = new ToolEventHandler();

    }

    initializeTools() {
        this.tools.forEach((tool) => {
            tool.addActionListener(this.toolEventHandler, this.editor);
            const toolElement = this.editor.editorContainer.querySelector(`#${tool.id}`);
            if (toolElement) {
                toolElement.addEventListener("click", () => {
                    this.editor.setActiveTool(tool);
                });
            }
        });
    }
}

export default ToolManager;
