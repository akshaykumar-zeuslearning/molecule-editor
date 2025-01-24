import { defaultConstant } from "./constant.js";
import Node from "./Graph/node.js";
import { generateId } from "./id-generator.js";
import { getSvgCoordinates, isWithinRadius, parseSubscriptText } from "./util.js";

class DrawTextAtom {
    constructor(editor) {
        this.editor = editor;
        this.editorContainer = editor.editorContainer;
        this.canvas = editor.canvas;
        this.popup = editor.popup;
        this.svgRect = this.editorContainer.getBoundingClientRect();
        this.popupCoords = editor.popupCoords;
    }

    handleSVGClick(event) {
        const rect = this.editorContainer.getBoundingClientRect();
        const { x, y } = getSvgCoordinates(event, rect);
        let clickedOnAtom = false;
        const textElements = this.canvas.querySelectorAll("text");

        textElements.forEach((textElement) => {
            const textX = parseFloat(textElement.getAttribute("x"));
            const textY = parseFloat(textElement.getAttribute("y"));
            if (isWithinRadius(x, y, textX, textY, defaultConstant.SNAP_THRESHOLD)) {

                clickedOnAtom = true;
                this.editor.selectedAtom = textElement;
                this.popup.showPopup(textX + this.svgRect.left, textY + this.svgRect.top);
            }
        });
        if (!clickedOnAtom) {
            this.popup.showPopup(event.clientX, event.clientY);
            this.popupCoords = { x, y };
        }
    }

    removeAtom() {
        this.editor.selectedAtom = null;
    }

    addAtom(x, y, text) {
        const textElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );
        textElement.setAttribute("x", x);
        textElement.setAttribute("y", y + 5);
        textElement.setAttribute("font-size", "16");
        textElement.setAttribute("text-anchor", "middle");
        textElement.setAttribute("fill", "black");
        textElement.classList.add("atom")
        const parts = parseSubscriptText(text);
        parts.forEach(({ base, sub }) => {
            const baseTspan = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "tspan"
            );
            baseTspan.textContent = base;

            const subTspan = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "tspan"
            );
            if (sub) {
                subTspan.textContent = sub;
                subTspan.setAttribute("font-size", "12");
                subTspan.setAttribute("baseline-shift", "sub");
            }

            textElement.appendChild(baseTspan);
            if (sub) textElement.appendChild(subTspan);
        });

        const existingNode = this.editor.molecedGraph.findNearestAtom({ x, y: y + 5 });
        if (!existingNode) {
            const textId = generateId();
            textElement.id = `node-${textId}`;
            const node = new Node(textId, text, true)
            node.setCoordinates(x, y);
            this.editor.graph.addNode(node);
        } else {
            textElement.id = `node-${existingNode.id}`;
            existingNode.setValue(text);
            existingNode.setVisible(true);
            const edges = this.editor.graph.findEdgesByNodeId(existingNode.id);
            for (const edge of edges) {
                const edgeElement = this.editor.canvas.querySelector(`[id="edge-${edge.id}"]`);
                let adjustedCoordinates = null;
                const x1 = edgeElement?.x1.baseVal.value;
                const y1 = edgeElement?.y1.baseVal.value;
                const x2 = edgeElement?.x2.baseVal.value;
                const y2 = edgeElement?.y2.baseVal.value;
                if (edgeElement) {
                    adjustedCoordinates = this.editor.shrinkLine(x1, y1, x2, y2, 20);
                }

                if (adjustedCoordinates && x1 === x && y1 === y) {
                    edgeElement.setAttribute(
                        "x1",
                        adjustedCoordinates.x1,
                    );
                    edgeElement.setAttribute(
                        "y1",
                        adjustedCoordinates.y1,
                    );
                }

                if (x2 === x && y2 === y) {
                    edgeElement.setAttribute(
                        "x2",
                        adjustedCoordinates.x2,
                    );
                    edgeElement.setAttribute(
                        "y2",
                        adjustedCoordinates.y2,
                    );
                }
            }
        }
        this.canvas.appendChild(textElement);

        textElement.addEventListener("click", () => {
            if (this.editor.currentTool !== "pencil") return;
            this.editor.selectedAtom = textElement;
            this.popup.showPopup(x + this.svgRect.left, y + this.svgRect.top);
        });

        textElement.addEventListener("mouseenter", () => this.editor.currentTool === "pencil" && this.highlightAtom(textElement));
        textElement.addEventListener("mouseleave", () => this.editor.currentTool === "pencil" && this.resetAtomColor(textElement));
    }

    handleLetterClick(event) {
        const atom = event.symbol;

        const nearestAtom = this.editor.molecedGraph.findNearestAtom(this.popupCoords);
        if (nearestAtom) {
            nearestAtom.setValue(atom);
            nearestAtom.setVisible(true);
        }
        if (this.editor.selectedAtom) {
            const parts = parseSubscriptText(atom);
            this.editor.selectedAtom.textContent = '';
            parts.forEach(({ base, sub }) => {
                const baseTspan = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "tspan"
                );
                baseTspan.textContent = base;

                const subTspan = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "tspan"
                );
                if (sub) {
                    subTspan.textContent = sub;
                    subTspan.setAttribute("font-size", "12");
                    subTspan.setAttribute("baseline-shift", "sub");
                }

                this.editor.selectedAtom.appendChild(baseTspan);
                if (sub) this.editor.selectedAtom.appendChild(subTspan);
                this.editor.selectedAtom.setAttribute("id", `node-${nearestAtom.id}`);
                this.editor.undoRedoManager.saveState();
            });
            this.editor.selectedAtom = null;
        } else {
            const nearestEndpoint = this.editor.molecedGraph.findNearestAtom(this.popupCoords);
            const point = nearestEndpoint || this.popupCoords;
            this.addAtom(point.x, point.y, atom);
            this.editor.undoRedoManager.saveState();
        }
        this.popup.popup.style.display = "none";
    }

    highlightAtom(atomElement) {
        atomElement.setAttribute("fill", "red");
    }

    resetAtomColor(atomElement) {
        atomElement.setAttribute("fill", "black");
    }
}

export default DrawTextAtom;
