import Node from "./node.js";
import { generateId } from "../id-generator.js";

class MolecedGraph {
    constructor(editor) {
        this.editor = editor;
        // this.container = editor.editorContainer;
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

    addEdgefromSVG(params) {
        let x1 = params.x1;
        let y1 = params.y1;
        let x2 = params.x2;
        let y2 = params.y2;
        let currentLine = params.line;
        let length = params.length;

        let node1;
        let node2;
        const node1Found = this.editor.graph.findNearestAtom({ x: x1, y: y1 });
        const node2Found = this.editor.graph.findNearestAtom({ x: x2, y: y2 });
        const shrinkDistance = 20;
        if (node1Found && node2Found) {
            node1 = node1Found;
            node2 = node2Found;
            if (node1.isVisible !== false && node2.isVisible !== false) {
                const adjustedCoordinates = this.editor.shrinkLine(node1.x, node1.y, node2.x, node2.y, shrinkDistance);
                currentLine.setAttribute(
                    "x1",
                    adjustedCoordinates.x1,
                );
                currentLine.setAttribute(
                    "y1",
                    adjustedCoordinates.y1,
                );
                currentLine.setAttribute(
                    "x2",
                    adjustedCoordinates.x2,
                );
                currentLine.setAttribute(
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
                currentLine.setAttribute(
                    "x1",
                    adjustedCoordinates.x1,
                );
                currentLine.setAttribute(
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
                currentLine.setAttribute(
                    "x2",
                    adjustedCoordinates.x2,
                );
                currentLine.setAttribute(
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
        currentLine.setAttribute("id", `edge-${this.editor.graph.globalEdgeId}`);
        this.editor.graph.addEdge(node1.id, node2.id, { length });
    }

}

export default MolecedGraph;
