class UndoRedoManager {
    constructor(editor) {
        this.editor = editor;
        this.undoStack = [];
        this.redoStack = [];
        this.captureInitialState(); // Capture the initial state of the graph
    }

    captureInitialState() {
        const initialState = JSON.stringify(this.editor.graph.getGraph());
        this.undoStack.push(initialState);
    }

    saveState() {
        const currentState = JSON.stringify(this.editor.graph.getGraph());
        if (this.undoStack[this.undoStack.length - 1] !== currentState) {
            this.undoStack.push(currentState);
            this.redoStack = [];
        }
    }

    undo() {
        if (this.canUndo()) {
            const lastState = this.undoStack.pop();
            this.redoStack.push(lastState);

            const previousState = this.undoStack[this.undoStack.length - 1] || '{}';
            // console.log('previousState', previousState);
            this.editor.setGraph(previousState);
            // console.log('Undo performed:', JSON.parse(previousState));
            return JSON.parse(previousState);
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            const lastUndoneState = this.redoStack.pop();
            this.undoStack.push(lastUndoneState);

            this.editor.setGraph(lastUndoneState);
            // console.log('Redo performed:', JSON.parse(lastUndoneState));
            return JSON.parse(lastUndoneState);
        }
        return null;
    }

    canUndo() {
        return this.undoStack.length > 1; // At least one previous state to revert to
    }

    canRedo() {
        return this.redoStack.length > 0;
    }
}

export default UndoRedoManager;
