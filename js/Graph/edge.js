import { Types } from "../constant.js";

class Edge {
    constructor(id, nodes, length, isHighlighted = false, style = {}, additionalProps = {}) {
        this.id = id;
        this.type = Types.BOND;
        this.nodes = nodes;
        this.length = length;
        this.isHighlighted = isHighlighted;
        this.style = style;
        Object.assign(this, additionalProps);
    }

    setHighlighted(isHighlighted) {
        this.isHighlighted = isHighlighted;
    }

    setStyle(style) {
        this.style = style;
    }

    setLength(length) {
        this.length = length;
    }

    setNodes(nodes) {
        this.nodes = nodes;
    }
}   

export default Edge;
