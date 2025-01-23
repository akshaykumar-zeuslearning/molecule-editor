class Eraser {
    constructor(editor) {
        this.editor = editor;
        this.highlightElement = null;
    }

    eraseElement() {
        const target = this.highlightElement;
        if (target && target.tagName === "text") {
            target.classList.remove("highlight");
            const x = parseFloat(target.getAttribute("x"));
            const y = parseFloat(target.getAttribute("y"));

            this.editor.canvas.removeChild(target);
            const node = this.editor.graph.findNearestAtom({ x, y: y - 5 });
            const edges = this.editor.graph.findEdgesByNodeId(node.id);
            for (const edge of edges) {
                const edgeElement = this.editor.canvas.querySelector(`[id="edge-${edge.id}"]`);
                if (edge.nodes[0] === node.id) {
                    edgeElement.setAttribute("x1", node.x);
                    edgeElement.setAttribute("y1", node.y);
                } else {
                    edgeElement.setAttribute("x2", node.x);
                    edgeElement.setAttribute("y2", node.y);
                }
            }
            this.editor.graph.removeNode(node.id);
            this.editor.undoRedoManager.saveState();
        } else if (target && target.tagName === "line") {
            target.classList.remove("highlight");
            const x1 = parseFloat(target.getAttribute("x1"));
            const y1 = parseFloat(target.getAttribute("y1"));
            const x2 = parseFloat(target.getAttribute("x2"));
            const y2 = parseFloat(target.getAttribute("y2"));

            const node1 = this.editor.graph.findNearestAtom({ x: x1, y: y1 });
            const node2 = this.editor.graph.findNearestAtom({ x: x2, y: y2 });
            if (node1 && node2) {
                this.editor.canvas.removeChild(target);
                this.editor.graph.removeEdge(node1.id, node2.id);
            }
            this.editor.undoRedoManager.saveState();
        }
    }

    createHighlightEraseElement(e) {
        const { offsetX, offsetY } = e;
        const highlightElement = this.editor.getClosestElement(offsetX, offsetY);
        let closestElement;
        if (highlightElement) {
            closestElement = this.editor.canvas.querySelector(`[id="${highlightElement.type.toLowerCase()}-${highlightElement.id}"]`);
        }
        if (closestElement !== this.highlightElement) {
            if (this.highlightElement) {
                this.removeHighlight(this.highlightElement);
            }
            this.highlightElement = closestElement;
            if (this.highlightElement) {
                this.addHighlight(this.highlightElement);
            }
        }
    }

    addHighlight(element) {
        element.classList.add("highlight");
    }

    removeHighlight(element) {
        element.classList.remove("highlight");
    }
}

export default Eraser;
