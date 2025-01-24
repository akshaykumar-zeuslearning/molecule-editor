class Canvas {
    constructor(editor) {
        this.editor = editor;
        this.container = editor.editorContainer;
        this.canvas = null;
        this.createSvgCanvas();
        this.initCanvas();
        this.dragging = false;
    }

    createSvgCanvas() {
        const drawingArea = document.createElement("div");
        drawingArea.className = "drawing-area";
        drawingArea.id = "drawingArea";

        const instructionText = document.createElement("div");
        instructionText.className = "instruction-text";
        instructionText.id = "instructionText";
        instructionText.textContent = "Click and drag to start drawing a structure.";
        drawingArea.appendChild(instructionText);

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = "canvas";
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        drawingArea.appendChild(svg);

        this.container.appendChild(drawingArea);
    }

    initCanvas() {
        this.canvas = this.container.querySelector("#canvas");
        this.canvas.addEventListener("mouseover", (e) => {
            this.editor.onMouseHover(e);
        })
        this.canvas.addEventListener("mouseout", (e) => {
            this.editor.onMouseOut(e);
        })
        this.canvas.addEventListener("click", (e) => {
            if (!this.dragging) {
                this.editor.onHandleClick(e);
            }
            this.dragging = false;
        });
        this.canvas.addEventListener("mousedown", (e) => {
            this.dragging = false;
        //     this.editor.onMouseDown(e);
        });
        this.canvas.addEventListener("mousemove", (e) => {
            this.dragging = true;
            // this.editor.onMouseMove(e);
        });
        this.canvas.addEventListener("mouseup", (e) => {
            // this.editor.onMouseUp(e);
        });
    }

    getCanvas() {
        return this.canvas;
    }
}

export default Canvas;
