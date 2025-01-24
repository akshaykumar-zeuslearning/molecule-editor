import { defaultConstant, Types } from "./constant.js";
import Node from "./Graph/node.js";
import { generateId } from "./id-generator.js";
import { isWithinRadius } from "./util.js";

class DrawLine {
    constructor(editor) {
        this.editor = editor;
        this.editorContainer = editor.editorContainer;
        this.instructionText =
            this.editorContainer.querySelector(".instruction-text");
        this.canvas = editor.canvas;
        this.highlightCircle = null;
        this.currentLine = null;
        this.startPoint = null;
        this.isDrawing = false;
        this.snapThreshold = defaultConstant.SNAP_THRESHOLD;
        this.previousMousePosition = null;
    }

    //function on MouseDown in Draw Mode
    drawLine(e) {
        this.instructionText.classList.add("hidden");
        const point = this.getMousePosition(e);
        const nearestAtom = this.editor.graph.findNearestAtom(point);
        this.startPoint = nearestAtom || point;
        this.showSnapHighlight(this.startPoint);

        if (nearestAtom) {
            this.startPoint = nearestAtom;
        }

        const snapPoint = this.getSnappedPoint(
            this.startPoint,
            this.startPoint
        );
        const endX = snapPoint ? snapPoint.x : this.startPoint.x;
        const endY = snapPoint ? snapPoint.y : this.startPoint.y;
        
        this.isDrawing = true;
        this.currentLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );
        this.currentLine.setAttribute("x1", this.startPoint.x);
        this.currentLine.setAttribute("y1", this.startPoint.y);
        this.currentLine.setAttribute("x2", endX);
        this.currentLine.setAttribute("y2", endY);
        this.currentLine.setAttribute("stroke", "black");
        this.currentLine.setAttribute("stroke-width", "2");

        this.canvas.appendChild(this.currentLine);
    }

    //function on MouseMove in Draw Mode
    draw(e) {
        const currentPoint = this.getMousePosition(e);

        const nearestAtom = this.editor.graph.findNearestAtom(currentPoint);
        if (nearestAtom) {
            this.showSnapHighlight(nearestAtom);
        } else {
            this.showSnapHighlight(nearestAtom);
        }
        if (!this.isDrawing) return;

        let endPoint = nearestAtom || currentPoint;
        endPoint = this.getSnappedPoint(this.startPoint, endPoint);
        // TODO: need to fix shrink line when dragging
        // if (!nearestAtom && this.startPoint.x !== endPoint.x || this.startPoint.y !== endPoint.y) {
        //     const adjustedCoordinates = this.editor.shrinkLine(this.startPoint.x, this.startPoint.y, endPoint.x, endPoint.y, 20);
        //     if (adjustedCoordinates) {
        //         this.currentLine.setAttribute("x1", adjustedCoordinates.x1);
        //         this.currentLine.setAttribute("y1", adjustedCoordinates.y1);
        //     }
        // }

        this.currentLine.setAttribute("x2", endPoint.x);
        this.currentLine.setAttribute("y2", endPoint.y);
        
    }

    //function on MouseUp in Draw Mode
    stopDrawing() {
        if (!this.isDrawing) return;
        const x1 = this.currentLine.x1.baseVal.value;
        const y1 = this.currentLine.y1.baseVal.value;
        const x2 = this.currentLine.x2.baseVal.value;
        const y2 = this.currentLine.y2.baseVal.value;

        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        if (length < 20) {
            this.currentLine.remove();
        } else {
            let node1;
            let node2;
            const node1Found = this.editor.graph.findNearestAtom({x: x1, y: y1});
            const node2Found = this.editor.graph.findNearestAtom({ x: x2, y: y2 });
            const shrinkDistance = 20;
            if (node1Found && node2Found) {
                node1 = node1Found;
                node2 = node2Found;
                if (node1.isVisible !== false && node2.isVisible !== false) {
                    const adjustedCoordinates = this.editor.shrinkLine(node1.x, node1.y, node2.x, node2.y, shrinkDistance);
                    this.currentLine.setAttribute(
                        "x1",
                        adjustedCoordinates.x1,
                    );
                    this.currentLine.setAttribute(
                        "y1",
                        adjustedCoordinates.y1,
                    );
                    this.currentLine.setAttribute(
                        "x2",
                        adjustedCoordinates.x2,
                    );
                    this.currentLine.setAttribute(
                        "y2",
                        adjustedCoordinates.y2,
                    );
                }
            } else if (node1Found) {
                node1 = node1Found;
                node2 = new Node(generateId(), "C");
                node2.setCoordinates(x2, y2);
                this.editor.graph.addNode(node2);
                if (node1.isVisible !== false) {
                    const adjustedCoordinates = this.editor.shrinkLine(node1.x, node1.y, x2, y2, shrinkDistance);
                    this.currentLine.setAttribute(
                        "x1",
                        adjustedCoordinates.x1,
                    );
                    this.currentLine.setAttribute(
                        "y1",
                        adjustedCoordinates.y1,
                    );
                }
            } else if (node2Found) {
                node2 = node2Found;
                node1 = new Node(generateId(), "C");
                node1.setCoordinates(x1, y1);
                this.editor.graph.addNode(node1);
                if (node2.isVisible !== false) {
                    const adjustedCoordinates = this.editor.shrinkLine(x1, y1, node2.x, node2.y, shrinkDistance);
                    this.currentLine.setAttribute(
                        "x2",
                        adjustedCoordinates.x2,
                    );
                    this.currentLine.setAttribute(
                        "y2",
                        adjustedCoordinates.y2,
                    );
                }
            } else {
                node1 = new Node(generateId(), "C");
                node1.setCoordinates(x1, y1);
                node2 = new Node(generateId(), "C");
                node2.setCoordinates(x2, y2);
                this.editor.graph.addNode(node1);
                this.editor.graph.addNode(node2);
            }
            this.currentLine.setAttribute("id", `edge-${this.editor.graph.globalEdgeId}`);
            this.editor.graph.addEdge(node1.id, node2.id, { length });
        }

        this.isDrawing = false;
        this.currentLine = null;
        this.startPoint = null;
    }

    getSnappedPoint(startPoint, currentPoint) {
        const atomSnap = this.editor.graph.findNearestAtom(currentPoint);
        if (atomSnap) {
            return atomSnap;
        }

        const dx = currentPoint.x - startPoint.x;
        const dy = currentPoint.y - startPoint.y;

        if (Math.abs(dy) <= this.snapThreshold) {
            currentPoint.y = startPoint.y;
        } else if (Math.abs(dx) <= this.snapThreshold) {
            currentPoint.x = startPoint.x;
        }
        return currentPoint;
    }

    showSnapHighlight(snapPoint) {
        if (snapPoint) {
            if (!this.highlightCircle) {
                this.highlightCircle = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                );
                this.highlightCircle.setAttribute("fill", "yellow");
                this.highlightCircle.setAttribute("opacity", "0.3");
                this.canvas.appendChild(this.highlightCircle);
            }
            this.highlightCircle.setAttribute("cx", snapPoint.x);
            this.highlightCircle.setAttribute("cy", snapPoint.y);
            this.highlightCircle.setAttribute("r", defaultConstant.SNAP_THRESHOLD);
            this.highlightCircle.style.display = "block";
        } else {
            this.hideSnapHighlight();
        }
    }

    hideSnapHighlight() {
        if (this.highlightCircle) {
            this.highlightCircle.style.display = "none";
        }
    }

    getMousePosition(e) {
        const rect = this.editorContainer.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }
}

export default DrawLine;
