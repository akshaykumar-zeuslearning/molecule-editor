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
        const { x1, y1, x2, y2, line: currentLine, length } = params;
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

    addNodefromSVG(params) {
        const { x, y, text } = params;
        const textId = generateId();
        const textElementId = `node-${textId}`;
        const node = new Node(textId, text, true)
        node.setCoordinates(x, y);
        this.editor.graph.addNode(node);
        return textElementId
    }

    replaceNodefromSVG(params) {
        const { x, y, textId: existingNodeId } = params;
        const edges = this.editor.graph.findEdgesByNodeId(existingNodeId);
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

}

export default MolecedGraph;
