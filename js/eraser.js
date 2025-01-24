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
            const node = this.editor.molecedGraph.findNearestAtom({ x, y: y - 5 });
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
            const edgeId = target.id.replace("edge-", "");
            const edge = this.editor.graph.findEdgeById(parseInt(edgeId));
            const findNode1 = this.editor.graph.findNodeById(edge.nodes[0]);
            const findNode2 = this.editor.graph.findNodeById(edge.nodes[1]);
            if (findNode1 && findNode2) {
                this.editor.canvas.removeChild(target);
                this.editor.graph.removeEdge(findNode1.id, findNode2.id);
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
