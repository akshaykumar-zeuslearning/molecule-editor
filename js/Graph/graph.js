import { defaultConstant } from "../constant.js";
import { isWithinRadius } from "../util.js";
import Edge from "./edge.js";
import Node from "./node.js";
import SubGraph from "./subgraph.js";

class Graph {
    constructor() {
        this.subgraphs = [];
        this.globalEdgeId = 1;
        this.subgraphId = 1;
    }

    createSubgraph() {
        const subgraph = new SubGraph(this.subgraphId++);
        this.subgraphs.push(subgraph);
        return subgraph;
    }

    findSubgraphByNode(nodeId) {
        return this.subgraphs.find((subgraph) => subgraph.containsNode(nodeId));
    }

    addNode(node) {
        let subgraph = this.findSubgraphByNode(node.id);
        if (!subgraph) {
            subgraph = this.createSubgraph();
        }
        subgraph.addNode(node);
    }

    addEdge(nodeId1, nodeId2, metadata = {}) {
        const { length } = metadata;
        const subgraph1 = this.findSubgraphByNode(nodeId1);
        const subgraph2 = this.findSubgraphByNode(nodeId2);

        const edge = new Edge(this.globalEdgeId++, [nodeId1, nodeId2], length);

        if (subgraph1 && subgraph2) {
            if (subgraph1.id === subgraph2.id) {
                subgraph1.addEdge(edge);
            } else {
                this.mergeSubgraphs(subgraph1, subgraph2);
                subgraph1.addEdge(edge);
            }
        } else if (subgraph1) {
            const node2 = new Node(nodeId2);
            subgraph1.addNode(node2);
            subgraph1.addEdge(edge);
        } else if (subgraph2) {
            const node1 = new Node(nodeId1);
            subgraph2.addNode(node1);
            subgraph2.addEdge(edge);
        } else {
            const subgraph = this.createSubgraph();
            const node1 = new Node(nodeId1);
            const node2 = new Node(nodeId2);
            subgraph.addNode(node1);
            subgraph.addNode(node2);
            subgraph.addEdge(edge);
        }
    }

    mergeSubgraphs(subgraph1, subgraph2) {
        subgraph1.nodes.push(...subgraph2.nodes);
        subgraph1.edges.push(...subgraph2.edges);
        this.subgraphs = this.subgraphs.filter((sg) => sg.id !== subgraph2.id);
    }

    mergeNodes(nodeId1, nodeId2) {
        const subgraph1 = this.findSubgraphByNode(nodeId1.id);
        if (!subgraph1) return;

        const subgraph2 = this.findSubgraphByNode(nodeId2.id);
        if (!subgraph2) return;

        if (subgraph1 !== subgraph2) {
            subgraph1.nodes.push(...subgraph2.nodes);
            subgraph1.edges.push(...subgraph2.edges);
            this.subgraphs = this.subgraphs.filter(
                (subgraph) => subgraph !== subgraph2
            );
        }

        if (!nodeId1 || !nodeId2) return;

        for (const edge of subgraph1.edges) {
            const nodeIndex = edge.nodes.indexOf(nodeId1.id);
            if (nodeIndex !== -1) {
                edge.nodes[nodeIndex] = nodeId2.id;
            }
        }

        subgraph1.nodes = subgraph1.nodes.filter(
            (node) => node.id !== nodeId1.id
        );
    }    

    getNodeToKeepAndNodeToRemove(node2, node1) {
        let nodeToKeep = node2;
        if (node1.isVisible && node2.isVisible) {
            nodeToKeep = node2;
        } else if (!node1.isVisible && node2.isVisible) {
            nodeToKeep = node2;
        } else if (node1.isVisible && !node2.isVisible) {
            nodeToKeep = node1;
        } else if (!node1.isVisible && !node2.isVisible) {
            nodeToKeep = node2;
        }

        const nodeToRemove = nodeToKeep === node1 ? node2 : node1;
        return { nodeToRemove, nodeToKeep };
    }

    removeEdge(nodeId1, nodeId2) {
        const subgraph = this.findSubgraphByNode(nodeId1);
        if (!subgraph) return;

        const edge = subgraph.edges.find(
            (e) => e.nodes.includes(nodeId1) && e.nodes.includes(nodeId2)
        );

        if (!edge) return;

        subgraph.removeEdge(edge);

        [nodeId1, nodeId2].forEach((nodeId) => {
            const node = subgraph.nodes.find((n) => n.id === nodeId);
            if (node && !node.isVisible && !subgraph.isNodeConnected(nodeId)) {
                subgraph.removeNode(nodeId);
            }
        });

        const connectedComponents = subgraph.getConnectedComponents();

        this.subgraphs = this.subgraphs.filter((sg) => sg.id !== subgraph.id);
        for (const component of connectedComponents) {
            const newSubgraph = this.createSubgraph();
            newSubgraph.nodes.push(...component);
            newSubgraph.edges.push(
                ...subgraph.edges.filter((e) =>
                    component.some((node) => e.nodes.includes(node.id))
                )
            );
        }
    }

    removeNode(nodeId) {
        const subgraph = this.findSubgraphByNode(nodeId);
        if (!subgraph) return;

        const nodeIndex = subgraph.nodes.findIndex(
            (node) => node.id === nodeId
        );

        if (nodeIndex !== -1) {
            const node = subgraph.nodes[nodeIndex];

            const isConnected = subgraph.edges.some((edge) =>
                edge.nodes.includes(nodeId)
            );

            if (!isConnected) {
                subgraph.nodes.splice(nodeIndex, 1);
            } else {
                subgraph.nodes[nodeIndex].setValue("C");
                subgraph.nodes[nodeIndex].setVisible(false);
            }
        }

        if (subgraph.nodes.length === 0 && subgraph.edges.length === 0) {
            this.subgraphs = this.subgraphs.filter(
                (sg) => sg.id !== subgraph.id
            );
        }
    }

    removeSubgraph(subgraph) {
        this.subgraphs = this.subgraphs.filter((sg) => sg.id !== subgraph.id);
    }

    getGraph() {
        return {
            id: "0",
            nodes: this.subgraphs,
            edges: [],
        };
    }

    setGraph(graph) {
        const { nodes } = graph;
        return {
            id: "0",
            nodes: nodes,
            edges: [],
        };
    }

    getBoundingBoxes() {
        return this.subgraphs.map((subgraph) => subgraph.getBoundingBoxes());
    }

    findSubgraphByPoint(point) {
        const { x, y } = point;
        for (const subgraph of this.subgraphs) {
            const { minX, minY, maxX, maxY } = subgraph.getBoundingBoxes();
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                return subgraph;
            }
        }
        return null;
    }

    moveSubgraph(subgraph, dx, dy) {
        subgraph.nodes.forEach((node) => {
            node.x += dx;
            node.y += dy;
        });
    }

    calculateAndSetEdgeLengthById(edgeId) {
        const edge = this.findEdgeById(edgeId);
        const findNode1 = this.findNodeById(edge.nodes[0]);
        const findNode2 = this.findNodeById(edge.nodes[1]);
        edge.setLength(this.calculateEdgeLength(findNode1, findNode2));
    }

    calculateEdgeLength(node1, node2) {
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getConnectedNodeAndEdges(point) {
        const { x, y } = point;
        const nodes = new Set();
        const edges = new Set();
        for (const subgraph of this.subgraphs) {
            for (const node of subgraph.nodes) {
                if (isWithinRadius(x, y, node.x, node.y, 20)) {
                    nodes.add(node);
                }
            }
            for (const edge of subgraph.edges) {
                for (const nodeId of edge.nodes) {
                    const node = this.findNodeById(nodeId);
                    if (node) {
                        if (isWithinRadius(x, y, node.x, node.y, 20)) {
                            nodes.add(node);
                            edges.add(edge);
                        }
                    }
                }
            }
        }
        return { nodes, edges };
    }

    // findNearestEndpoint(point) {
    //     const { x, y } = point;
    //     let nearestEndpoint = null;
    //     let minDistance = defaultConstant.SNAP_THRESHOLD;

    //     for (const subgraph of this.subgraphs) {
    //         for (const edge of subgraph.edges) {
    //             for (const nodeId of edge.nodes) {
    //                 const node = this.findNodeById(nodeId);
    //                 if (node) {
    //                     const distance = Math.sqrt(
    //                         (node.x - x) ** 2 + (node.y - y) ** 2
    //                     );
    //                     if (distance < minDistance) {
    //                         minDistance = distance;
    //                         nearestEndpoint = node;
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     return nearestEndpoint;
    // }

    findNodeById(nodeId) {
        for (const subgraph of this.subgraphs) {
            for (const node of subgraph.nodes) {
                if (node.id === nodeId) {
                    return node;
                }
            }
        }
        return null;
    }

    findEdgeById(edgeId) {
        for (const subgraph of this.subgraphs) {
            for (const edge of subgraph.edges) {
                if (edge.id === edgeId) {
                    return edge;
                }
            }
        }
        return null;
    }

    findEdgesByNodeId(nodeId) {
        const edges = [];
        for (const subgraph of this.subgraphs) {
            for (const edge of subgraph.edges) {
                if (edge.nodes.includes(nodeId)) {
                    edges.push(edge);
                }
            }
        }
        return edges;
    }

    findNodesByPoint(point) {
        const { x, y } = point;
        const edges = [];
        let minDistance = defaultConstant.SNAP_THRESHOLD;
        for (const subgraph of this.subgraphs) {
            for (const edge of subgraph.edges) {
                for (const nodeId of edge.nodes) {
                    const node = this.findNodeById(nodeId);
                    if (node) {
                        const distance = Math.sqrt(
                            (node.x - x) ** 2 + (node.y - y) ** 2
                        );
                        if (distance < minDistance) {
                            edges.push(edge);
                        }
                    }
                }
            }
        }
        return edges;
    }

    findNodeByPoint(point) {
        for (const subgraph of this.subgraphs) {
            for (const node of subgraph.nodes) {
                if (node.x === point.x && node.y === point.y) {
                    return node;
                }
            }
        }
        return null;
    }

    getAllNodes() {
        const allNodes = [];
        for (const subgraph of this.subgraphs) {
            allNodes.push(...subgraph.nodes);
        }
        return allNodes;
    }

    clear() {
        this.subgraphs = [];
    }
}

export default Graph;
