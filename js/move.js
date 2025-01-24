import { Types } from "./constant.js";
import PopupManager from "./popup.js";

function createIconButton(iconClass, eventName, buttonText) {
    const button = document.createElement("button");
    button.className = `icon-button ${iconClass}`;
    button.innerHTML = buttonText;
    return {
        selector: `.${iconClass}`,
        eventName: eventName,
        data: () => ({ action: buttonText }),
    };
}

const actionButtons = [
    `<svg fill="#000000" height="18" width="18" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
        <g id="Text-files">
            <path d="M53.9791489,9.1429005H50.010849c-0.0826988,0-0.1562004,0.0283995-0.2331009,0.0469999V5.0228
                C49.7777481,2.253,47.4731483,0,44.6398468,0h-34.422596C7.3839517,0,5.0793519,2.253,5.0793519,5.0228v46.8432999
                c0,2.7697983,2.3045998,5.0228004,5.1378999,5.0228004h6.0367002v2.2678986C16.253952,61.8274002,18.4702511,64,21.1954517,64
                h32.783699c2.7252007,0,4.9414978-2.1725998,4.9414978-4.8432007V13.9861002
                C58.9206467,11.3155003,56.7043495,9.1429005,53.9791489,9.1429005z M7.1110516,51.8661003V5.0228
                c0-1.6487999,1.3938999-2.9909999,3.1062002-2.9909999h34.422596c1.7123032,0,3.1062012,1.3422,3.1062012,2.9909999v46.8432999
                c0,1.6487999-1.393898,2.9911003-3.1062012,2.9911003h-34.422596C8.5049515,54.8572006,7.1110516,53.5149002,7.1110516,51.8661003z
                M56.8888474,59.1567993c0,1.550602-1.3055,2.8115005-2.9096985,2.8115005h-32.783699
                c-1.6042004,0-2.9097996-1.2608986-2.9097996-2.8115005v-2.2678986h26.3541946
                c2.8333015,0,5.1379013-2.2530022,5.1379013-5.0228004V11.1275997c0.0769005,0.0186005,0.1504021,0.0469999,0.2331009,0.0469999
                h3.9682999c1.6041985,0,2.9096985,1.2609005,2.9096985,2.8115005V59.1567993z"/>
            <path d="M38.6031494,13.2063999H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0158005
                c0,0.5615997,0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4542999,1.0158997-1.0158997
                C39.6190491,13.6606998,39.16465,13.2063999,38.6031494,13.2063999z"/>
            <path d="M38.6031494,21.3334007H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0157986
                c0,0.5615005,0.4544001,1.0159016,1.0159006,1.0159016h22.3491974c0.5615005,0,1.0158997-0.454401,1.0158997-1.0159016
                C39.6190491,21.7877007,39.16465,21.3334007,38.6031494,21.3334007z"/>
            <path d="M38.6031494,29.4603004H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997
                s0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4543991,1.0158997-1.0158997
                S39.16465,29.4603004,38.6031494,29.4603004z"/>
            <path d="M28.4444485,37.5872993H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997
                s0.4544001,1.0158997,1.0159006,1.0158997h12.1904964c0.5615025,0,1.0158005-0.4543991,1.0158005-1.0158997
                S29.0059509,37.5872993,28.4444485,37.5872993z"/>
        </g>
    </svg>`,
    `<svg enable-background="new 0 0 48 48" height="18" version="1.1" viewBox="0 0 48 48" width="18"
        xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="Expanded">
            <g>
                <g>
                    <path d="M41,48H7V7h34V48z M9,46h30V9H9V46z" />
                </g>
                <g>
                    <path d="M35,9H13V1h22V9z M15,7h18V3H15V7z" />
                </g>
                <g>
                    <path
                        d="M16,41c-0.553,0-1-0.447-1-1V15c0-0.553,0.447-1,1-1s1,0.447,1,1v25C17,40.553,16.553,41,16,41z" />
                </g>
                <g>
                    <path
                        d="M24,41c-0.553,0-1-0.447-1-1V15c0-0.553,0.447-1,1-1s1,0.447,1,1v25C25,40.553,24.553,41,24,41z" />
                </g>
                <g>
                    <path
                        d="M32,41c-0.553,0-1-0.447-1-1V15c0-0.553,0.447-1,1-1s1,0.447,1,1v25C33,40.553,32.553,41,32,41z" />
                </g>
                <g>
                    <rect height="2" width="48" y="7" />
                </g>
            </g>
        </g>
    </svg>`
]
class Move {
    constructor(editor) {
        this.editor = editor;
        this.editorContainer = editor.editorContainer;
        this.startPoint = null;
        this.svgRect = this.editorContainer.getBoundingClientRect();
        this.popup = new PopupManager(editor, {
            headerText: "Actions",
            content: () => {
                const fragment = document.createDocumentFragment();
                actionButtons.forEach((icon) => {
                    const button = document.createElement("button");
                    button.className = "popup-button";
                    button.innerHTML = icon;
                    fragment.appendChild(button);
                });
                return fragment;
            },
            buttons: [
                createIconButton("copy-icon", "copy-action", "Copy"),
                createIconButton("delete-icon", "delete-action", "Delete"),
            ],
        });
        this.subgraph = null;
    }

    startMoving(e) {
        const point = this.editor.drawLineTool.getMousePosition(e);
        const nearestEndpoint = this.editor.graph.findNearestEndpoint(point);
        this.startPoint = nearestEndpoint || point;
        this.subgraph = this.editor.graph.findSubgraphByPoint(point);
        const { nodes: selectedNodes, edges: selectedEdges } = this.editor.graph.getConnectedNodeAndEdges(point);
        this.editor.diagramStartCoords.push(...Array.from(selectedNodes), ...Array.from(selectedEdges));
    }

    hover(e) {
    }

    move(e) {
        this.removeBoundingBoxes();
        const boundingBoxes = this.editor.graph.getBoundingBoxes();
        this.drawBoundingBoxes(boundingBoxes);
        const currentPoint = this.editor.drawLineTool.getMousePosition(e);
        const nearestAtom = this.editor.graph.findNearestAtom(currentPoint);
        const nearestEndpoint = this.editor.graph.findNearestEndpoint(currentPoint);
        if (nearestAtom) {
            this.editor.drawLineTool.showSnapHighlight(nearestAtom);
        } else {
            this.editor.drawLineTool.showSnapHighlight(nearestAtom || nearestEndpoint);
        }
        if (!this.editor.isDragging) return;
        let finalPoint = nearestEndpoint || currentPoint;
        finalPoint = this.editor.molecedGraph.getSnappedPoint(this.startPoint, finalPoint);

        const node = this.editor.diagramStartCoords.find((coord) => coord.type === Types.ATOM);
        if (!node && this.subgraph) {
            const dx = currentPoint.x - this.startPoint.x;
            const dy = currentPoint.y - this.startPoint.y;
            this.moveDiagram(this.subgraph, dx, dy);
            this.editor.graph.moveSubgraph(this.subgraph, dx, dy);
        } else {
            for (const diagramStartCoord of this.editor.diagramStartCoords) {
                const elementType = diagramStartCoord.type.toLowerCase() === "bond" ? "edge" : "node";
                const element = this.editor.canvas.querySelector(`[id="${elementType}-${diagramStartCoord.id}"]`);
                if (diagramStartCoord.type === Types.ATOM) {
                    node.setCoordinates(finalPoint.x, finalPoint.y);
                    if (diagramStartCoord.isVisible) {
                        element.setAttribute("x", finalPoint.x);
                        element.setAttribute("y", finalPoint.y + 5);

                    }
                }
                if (element && diagramStartCoord.type === Types.BOND) {
                    const x1 = element.x1.baseVal.value;
                    const y1 = element.y1.baseVal.value;
                    const x2 = element.x2.baseVal.value;
                    const y2 = element.y2.baseVal.value;
                    if (diagramStartCoord.nodes[0] === node.id) {
                        const adjustedCoordinates = this.editor.shrinkLine(finalPoint.x, finalPoint.y, x2, y2, 20);
                        if (node.isVisible && adjustedCoordinates) {
                            element.setAttribute("x1", adjustedCoordinates.x1);
                            element.setAttribute("y1", adjustedCoordinates.y1);
                        } else {
                            element.setAttribute("x1", finalPoint.x);
                            element.setAttribute("y1", finalPoint.y);
                        }
                    } else {
                        const adjustedCoordinates = this.editor.shrinkLine(x1, y1, finalPoint.x, finalPoint.y, 20);
                        if (node.isVisible && adjustedCoordinates) {
                            element.setAttribute("x2", adjustedCoordinates.x2);
                            element.setAttribute("y2", adjustedCoordinates.y2);
                        } else {
                            element.setAttribute("x2", finalPoint.x);
                            element.setAttribute("y2", finalPoint.y);
                        }
                    }

                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    diagramStartCoord.setLength(length);
                }
            }
        }
        this.startPoint = currentPoint;
    }

    stopMoving(e) {
        const point = this.editor.drawLineTool.getMousePosition(e);
        const { nodes: selectedNodes } = this.editor.graph.getConnectedNodeAndEdges(point);
        this.editor.diagramStartCoords = [];
        
        if (selectedNodes.size !== 2) return;

        const [node1, node2] = Array.from(selectedNodes);

        const { nodeToKeep, nodeToRemove } = this.editor.graph.getNodeToKeepAndNodeToRemove(node2, node1);
        this.editor.graph.mergeNodes(nodeToRemove, nodeToKeep);

        const nodeElement = this.editor.canvas.querySelector(`[id="node-${nodeToRemove.id}"]`);
        if (nodeElement && nodeToRemove.isVisible) {
            this.editor.canvas.removeChild(nodeElement);
        }

        this.subgraph = null;
        this.editor.setGraph(JSON.stringify(this.editor.graph.getGraph()));
    }

    handleBoundingBoxClick(e) {
        const point = this.editor.drawLineTool.getMousePosition(e);
        const subgraph = this.editor.graph.findSubgraphByPoint(point);
        if (subgraph) {
            this.popup.showPopup(point.x + this.svgRect.left, point.y + this.svgRect.top);
        } else {
            this.popup.hidePopup();
        }
        // TODO: implement move action and delete action
    }

    moveDiagram(diagram, dx, dy) {
        const elements = this.editor.canvas.querySelectorAll(`[id^="edge-${diagram.edges.map(edge => edge.id).join('"],[id^="edge-')}"]`);
        for (const element of elements) {
            const x1 = element.x1.baseVal.value + dx;
            const y1 = element.y1.baseVal.value + dy;
            const x2 = element.x2.baseVal.value + dx;
            const y2 = element.y2.baseVal.value + dy;

            element.setAttribute("x1", x1);
            element.setAttribute("y1", y1);
            element.setAttribute("x2", x2);
            element.setAttribute("y2", y2);
        }

        const nodeElements = this.editor.canvas.querySelectorAll(`[id^="node-${diagram.nodes.filter(node => node.isVisible).map(node => node.id).join('"],[id^="node-')}"]`);
        for (const element of nodeElements) {
            const x = element.x.baseVal[0].value + dx;
            const y = element.y.baseVal[0].value + dy;
            element.setAttribute("x", x);
            element.setAttribute("y", y);
        }
    }

    drawBoundingBoxes(boundingBoxes, style = {}) {
        boundingBoxes.forEach(({ minX, minY, maxX, maxY }) => {
            const width = maxX - minX;
            const height = maxY - minY;

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", minX);
            rect.setAttribute("y", minY);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);

            rect.setAttribute("stroke", style.stroke || "grey");
            rect.setAttribute("stroke-width", style.strokeWidth || "1");
            rect.setAttribute("fill", style.fill || "none");

            rect.setAttribute("class", "bounding-box");

            this.editor.canvas.appendChild(rect);
        });
    }

    removeBoundingBoxes() {
        const boundingBoxes = this.editor.canvas.querySelectorAll(".bounding-box");
        boundingBoxes.forEach((box) => box.remove());
    }
}

export default Move;
