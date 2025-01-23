import { Types } from "../constant.js";

class Node {
    constructor(id, value = "C", isVisible = false, metadata = {}) {
        this.id = id;
        this.type = Types.ATOM;
        this.value = value;
        this.isVisible = isVisible;
        this.x = 0;
        this.y = 0;
        this.style = {};
        this.metadata = metadata;
    }

    setCoordinates(x, y) {
        this.x = x;
        this.y = y;
    }

    setValue(value) {
        this.value = value;
    }

    setVisible(isVisible) {
        this.isVisible = isVisible;
    }
}

export default Node;
    