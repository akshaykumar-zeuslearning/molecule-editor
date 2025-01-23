import { defaultConstant, Types } from "../constant.js";

class SubGraph {
    constructor(id) {
        this.id = id;
        this.nodes = [];
        this.edges = [];
        this.type = Types.SUBGRAPH;
    }

    addNode(node) {
        if (!this.nodes.some((n) => n.id === node.id)) {
            this.nodes.push(node);
        }
    }

    addEdge(edge) {
        this.edges.push(edge);
    }

    removeNode(nodeId) {
        const nodeIndex = this.nodes.findIndex((node) => node.id === nodeId);
        if (nodeIndex !== -1) {
            const node = this.nodes[nodeIndex];

            // Check if the node is connected to any edge
            const isConnected = this.edges.some((edge) =>
                edge.nodes.includes(nodeId)
            );

            if (!isConnected) {
                // Node is not connected, remove it
                this.nodes.splice(nodeIndex, 1);
            } else {
                // Node is connected, replace with "C" atom
                this.nodes[nodeIndex].setValue("C");
                this.nodes[nodeIndex].setVisible(false);
            }
        }
    }

    removeEdge(edge) {
        this.edges = this.edges.filter((e) => e.id !== edge.id);
    }

    containsNode(nodeId) {
        return this.nodes.some((node) => node.id === nodeId);
    }

    isNodeConnected(nodeId) {
        return this.edges.some((edge) => edge.nodes.includes(nodeId));
    }

    getConnectedNodeAndEdges(point) {
        const { x, y } = point;
        const nodes = this.nodes.filter((node) => {
            const { x: nodeX, y: nodeY } = node;
            return Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2) < 20;
        });
        const edges = this.edges.filter((edge) => {
            const { x1: edgeX1, y1: edgeY1, x2: edgeX2, y2: edgeY2 } = edge;
            return (
                Math.sqrt((x - edgeX1) ** 2 + (y - edgeY1) ** 2) < 20 ||
                Math.sqrt((x - edgeX2) ** 2 + (y - edgeY2) ** 2) < 20
            );
        });
        return { nodes, edges };
    }

    getConnectedComponents() {
        const visited = new Set();
        const components = [];

        const dfs = (node, component) => {
            visited.add(node.id);
            component.push(node);
            const connectedNodes = this.edges
                .filter((edge) => edge.nodes.includes(node.id))
                .flatMap((edge) => edge.nodes)
                .filter((id) => id !== node.id && !visited.has(id))
                .map((id) => this.nodes.find((n) => n.id === id));

            for (const connectedNode of connectedNodes) {
                dfs(connectedNode, component);
            }
        };

        for (const node of this.nodes) {
            if (!visited.has(node.id)) {
                const component = [];
                dfs(node, component);
                components.push(component);
            }
        }

        return components;
    }

    getBoundingBoxes() {
        const components = this.getConnectedComponents();
        const gap = defaultConstant.BOUNDING_BOX_GAP;
        const boundingBoxes = components.map((component) => {
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;

            for (const node of component) {
                const { x, y } = node;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }

            return {
                minX: minX - gap,
                minY: minY - gap,
                maxX: maxX + gap,
                maxY: maxY + gap
            };
        });

        return boundingBoxes[0];
    }
}

export default SubGraph;
