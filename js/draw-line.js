import { defaultConstant, Types } from "./constant.js";
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

        const snapPoint = this.editor.molecedGraph.getSnappedPoint(
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
        this.showSnapHighlight(nearestAtom);
        
        if (!this.isDrawing) return;

        let endPoint = nearestAtom || currentPoint;
        endPoint = this.editor.molecedGraph.getSnappedPoint(this.startPoint, endPoint);
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
            const edgeData = {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                line: this.currentLine,
                length: length
            }
            this.editor.molecedGraph.addEdgefromSVG(edgeData);
        }

        this.isDrawing = false;
        this.currentLine = null;
        this.startPoint = null;
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
