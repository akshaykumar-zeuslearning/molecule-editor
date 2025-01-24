import Canvas from "./canvas.js";
import DrawLine from "./draw-line.js";
import DrawTextAtom from "./draw-text.js";
import PopupManager from "./popup.js";
import UndoRedoManager from "./undo-redo-manager.js";
import Move from './move.js';
import Graph from "./Graph/graph.js";
import MolecedGraph from "./Graph/moleced-graph.js";
import Toolbar from "./toolbar.js";
import { tools } from "./tools.js";
import { formatSubscript } from "./util.js";
import Eraser from "./eraser.js";

class MoleculeEditor {
    constructor(editorContainer) {
        this.editorContainer = editorContainer;
        this.currentTool = "pencil";
        this.eraseRadius = 5;
        this.svg = new Canvas(this);
        this.toolbar = new Toolbar(this, { className: "toolbar", tools });
        this.popup = new PopupManager(this, {
            headerText: "Edit Atom",
            content: () => {
                const fragment = document.createDocumentFragment();
                const symbols = ["C", "N", "O", "H", "H2O", "C2H6", "O2"];
                symbols.forEach((symbol) => {
                    const button = document.createElement("button");
                    button.className = "popup-button";
                    button.setAttribute("data-symbol", symbol);
                    button.innerHTML = formatSubscript(symbol);
                    fragment.appendChild(button);
                });
                return fragment;
            },
            buttons: [
                {
                    selector: ".popup-button",
                    eventName: "button-click",
                    data: (el) => ({
                        element: el,
                        symbol: el.getAttribute("data-symbol"),
                    }),
                },
            ],
        });
        this.diagramStartCoords = [];
        this.instructionText = this.editorContainer.querySelector(".instruction-text");
        this.canvas = this.svg.getCanvas();
        this.graph = new Graph("graph");
        this.molecedGraph = new MolecedGraph(this);
        this.drawTextAtom = new DrawTextAtom(this);
        this.moveTool = new Move(this)
        this.drawLineTool = new DrawLine(this);
        this.eraser = new Eraser(this);
        this.undoRedoManager = new UndoRedoManager(this);

        this.bindKeyboardShortcuts();
    }
    bindKeyboardShortcuts() {
        this.popup.popup.addEventListener("button-click", (event) => {
            this.drawTextAtom.handleLetterClick(event.detail)
        });

        this.popup.popup.addEventListener("popup-close", () => {
            this.popup.hidePopup();
        });
    }


    onMouseHover(e) {
        this.moveTool.removeBoundingBoxes();
        if (this.currentTool === "move") {
            this.moveTool.hover(e);
            const boundingBoxes = this.graph.getBoundingBoxes();
            this.moveTool.drawBoundingBoxes(boundingBoxes);
        }
    }

    onMouseOut(e) {
        this.moveTool.removeBoundingBoxes();
    }

    onHandleClick(e) {
        if (this.currentTool === "pencil") {
            this.drawTextAtom.handleSVGClick(e);
        }
        if (this.currentTool === "move") {
            this.moveTool.handleBoundingBoxClick(e);
        }
    }

    onMouseUp(e) {
        if (this.currentTool === "move") {
            this.isDragging = false;
            this.moveTool.stopMoving(e);
            this.undoRedoManager.saveState();
        } else if (this.currentTool === "pencil") {
            this.drawLineTool.stopDrawing();
            this.undoRedoManager.saveState();
        }
    }
    onMouseDown(e) {
        if (this.currentTool === "move") {
            this.isDragging = true;
            this.moveTool.startMoving(e);
        } else if (this.currentTool === "pencil") {
            this.drawLineTool.drawLine(e);
        } else if (this.currentTool === "eraser") {
            this.eraser.eraseElement(e);
        }
    }

    onMouseMove(e) {
        if (this.currentTool === "move") {
            this.moveTool.move(e);
        } else if (this.currentTool === "pencil") {
            this.drawLineTool.draw(e);
        } else if (this.currentTool === "eraser") {
            this.eraser.createHighlightEraseElement(e);
        }
    }

    getClosestElement(x, y) {
        let closestElement = null;
        let minDistance = Infinity;

        for (const subgraph of this.graph.subgraphs) {
            for (const node of subgraph.nodes) {
                const textElement = this.canvas.getElementById(`node-${node.id}`);
                if (textElement && textElement.tagName === "text") {
                    const bbox = textElement.getBBox();
                    const isWithinBoundingBox =
                        x >= bbox.x &&
                        x <= bbox.x + bbox.width &&
                        y >= bbox.y &&
                        y <= bbox.y + bbox.height;

                    if (isWithinBoundingBox) {
                        closestElement = { type: "Node", id: node.id, node };
                        minDistance = 0;
                        break;
                    }
                }
            }
        }

        if (!closestElement) {
            for (const subgraph of this.graph.subgraphs) {
                for (const edge of subgraph.edges) {
                    const node1 = subgraph.nodes.find(node => node.id === edge.nodes[0]);
                    const node2 = subgraph.nodes.find(node => node.id === edge.nodes[1]);
                    if (node1 && node2) {
                        const distance = this.pointToLineDistance(x, y, node1.x, node1.y, node2.x, node2.y);
                        if (distance < this.eraseRadius && distance < minDistance) {
                            closestElement = { type: "Edge", id: edge.id, edge };
                            minDistance = distance;
                        }
                    }
                }
            }
        }

        return closestElement;
    }

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) {
            param = dot / len_sq;
        }

        let nearestX, nearestY;

        if (param < 0) {
            nearestX = x1;
            nearestY = y1;
        } else if (param > 1) {
            nearestX = x2;
            nearestY = y2;
        } else {
            nearestX = x1 + param * C;
            nearestY = y1 + param * D;
        }

        const dx = px - nearestX;
        const dy = py - nearestY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    shrinkLine(x1, y1, x2, y2, shrinkDistance) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        const length = Math.sqrt(dx * dx + dy * dy);

        const unitDx = dx / length;
        const unitDy = dy / length;

        const newX1 = x1 + shrinkDistance * unitDx;
        const newY1 = y1 + shrinkDistance * unitDy;

        const newX2 = x2 - shrinkDistance * unitDx;
        const newY2 = y2 - shrinkDistance * unitDy;

        return { x1: newX1, y1: newY1, x2: newX2, y2: newY2 };
    }

    getGraph() {
        return JSON.stringify(this.graph.getGraph(), null, 2);
    }

    setGraph(graphData) {
        this.svgRect = this.editorContainer.getBoundingClientRect();
        const graph = JSON.parse(graphData);
        this.clearCanvas();
        graph.nodes.forEach(subgraph => {
            const { nodes, edges } = subgraph;

            edges.forEach(edge => {
                const [nodeId1, nodeId2] = edge.nodes;
                const atom1 = nodes.find(n => n.id === nodeId1);
                const atom2 = nodes.find(n => n.id === nodeId2);

                if (atom1 && atom2) {
                    this.drawLineTool.startPoint = { x: atom1.x, y: atom1.y };
                    this.isDrawing = true;
                    this.drawLineTool.drawLine({
                        clientX: atom1.x + this.svgRect.left,
                        clientY: atom1.y + this.svgRect.top,
                    });
                    this.drawLineTool.draw({
                        clientX: atom2.x + this.svgRect.left,
                        clientY: atom2.y + this.svgRect.top,
                    });
                    this.drawLineTool.stopDrawing();
                }
            });

            nodes.forEach(node => {
                if (node.isVisible) {
                    this.drawTextAtom.addAtom(node.x, node.y, node.value);
                }
            });
        });

    }

    clearCanvas() {
        const elements = [
            ...Array.from(this.canvas.children),
        ];
        elements.forEach((el) => {
            this.canvas.removeChild(el);
        });
        this.graph.clear();
        this.instructionText.classList.remove("hidden");
    }

}

window.addEventListener("load", () => {
    const containers = document.querySelectorAll('.editor-container');
    Array.from(containers).map((container) => new MoleculeEditor(container));
});
