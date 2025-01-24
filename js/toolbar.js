class Toolbar {
    constructor(editor, options = {}) {
        this.editor = editor;
        this.container = editor.editorContainer;
        this.options = options;

        this.tools = options.tools || [];
        this.createToolbar();
    }

    createToolbar() {
        const toolbar = document.createElement("div");
        toolbar.className = this.options.className || "toolbar";

        this.tools.forEach((tool) => {
            const button = document.createElement("button");
            button.className = `${tool.class} tool-button`;
            button.id = tool.id;
            button.title = tool.title;
            button.innerHTML = tool.icon;
            button.disabled = tool.disabled;

            button.addEventListener("click", () => {
                this.editor.currentTool = tool.name;
                this.setActiveTool(button);
            });

            toolbar.appendChild(button);
        });

        this.container.appendChild(toolbar);
    }

    setActiveTool(activeButton) {
        const buttons = this.container.querySelectorAll(".tool-button");
        buttons.forEach((btn) => btn.classList.remove("active"));
        activeButton.classList.add("active");
    }
}

export default Toolbar;
