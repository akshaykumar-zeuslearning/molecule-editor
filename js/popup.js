class PopupManager {
    /**
     * Initializes the PopupManager.
     * @param {Editor} editor - The editor instance the popup belongs to.
     * @param {Object} [options={}] - Options for the popup.
     * @param {string} [options.id] - The id of the popup element.
     * @param {string} [options.className] - The CSS class name for the popup element.
     * @param {boolean} [options.showHeader=true] - Whether to show the header.
     * @param {string} [options.headerText] - The text content of the header.
     * @param {Function|String|HTMLElement} [options.content] - The content of the popup.
     * If a function, it will be called without arguments and its return value will
     * be appended to the popup content container. If a string, it will be appended
     * directly to the content container. If an HTMLElement, it will be appended to
     * the content container. If not provided, the popup will have no content.
     * @param {Array<Object>|Object} [options.buttons] - The buttons to include in the popup.
     * Each button should have the following properties:
     * - selector: The CSS selector to use to find the button element.
     * - eventName: The event name to dispatch when the button is clicked.
     * - data: An optional function which will be called with the button element as an argument.
     * It should return an object with the data to be dispatched with the event.
     */
    constructor(editor, options = {}) {
        if (!editor || !editor.editorContainer) {
            throw new Error("An editor with a valid container is required.");
        }

        this.editor = editor;
        this.container = editor.editorContainer;
        this.options = options;

        this.popup = this.createPopup();
        this.container.appendChild(this.popup);

        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.initPopupContent();
        this.initEventListeners();
    }

    /**
     * Creates the popup element.
     * @returns {HTMLElement} The created popup element.
     */
    createPopup() {
        const popup = document.createElement("div");
        popup.id = this.options.id || "popup";
        popup.className = this.options.className || "popup hidden";

        if (this.options.showHeader !== false) {
            popup.appendChild(this.createHeader());
        }

        const content = document.createElement("div");
        content.className = this.options.contentClassName || "popup-content";
        this.setContent(content);
        popup.appendChild(content);

        return popup;
    }

    /**
     * Creates the header element of the popup.
     * @returns {HTMLElement} The created header element.
     */
    createHeader() {
        const header = document.createElement("div");
        header.className = "popup-header";

        const title = document.createElement("span");
        title.textContent = this.options.headerText || "Popup";
        header.appendChild(title);

        const closeButton = document.createElement("button");
        closeButton.className = "close-btn";
        closeButton.innerHTML = this.options.closeButtonContent || "&times;";
        closeButton.addEventListener("click", () => this.hidePopup());
        header.appendChild(closeButton);

        return header;
    }

    /**
     * Sets the content of a given element based on the provided options.
     * 
     * This method evaluates the `content` property from the options and appends
     * or sets it to the `contentElement`. The `content` can be:
     * - a function: the function's return value is appended to the `contentElement`,
     * - a string: the string is set as the inner HTML of the `contentElement`,
     * - an HTMLElement: the element is appended to the `contentElement`,
     * - if none of the above, sets the text content to "No content provided".
     * 
     * @param {HTMLElement} contentElement - The element where the content will be set.
     */
    setContent(contentElement) {
        const { content } = this.options;

        if (typeof content === "function") {
            contentElement.appendChild(content());
        } else if (typeof content === "string") {
            contentElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentElement.appendChild(content);
        } else {
            contentElement.textContent = "No content provided";
        }
    }

    /**
     * Initializes the popup content.
     * 
     * This method iterates over the buttons provided in the options and adds
     * event listeners to the corresponding elements. When a button is clicked,
     * it dispatches a custom event with the given event name and data returned
     * from the data function if provided.
     */
    initPopupContent() {
        const { buttons = [] } = this.options;

        buttons.forEach(({ selector, eventName, data }) => {
            const elements = this.popup.querySelectorAll(selector);
            elements.forEach((el) => {
                el.addEventListener("click", () => {
                    this.dispatchCustomEvent(eventName, data ? data(el) : {});
                });
            });
        });
    }

    /**
     * Dispatches a custom event with the given name and detail object.
     * 
     * @param {string} eventName - The name of the custom event.
     * @param {Object} [detail={}] - The detail object to be passed to the custom event.
     */
    dispatchCustomEvent(eventName, detail = {}) {
        this.popup.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    /**
     * Initializes the event listeners required for the popup.
     * 
     * Two event listeners are added:
     * - A global mousedown event listener which will close the popup
     * if the user clicks outside of the popup.
     * - A mousedown event listener on the header element which will
     * start the drag action for the popup.
     */
    initEventListeners() {
        document.addEventListener("mousedown", (event) => this.handleOutsideClick(event));
        const header = this.popup.querySelector(".popup-header");
        if (header) {
            header.addEventListener("mousedown", (event) => this.startDrag(event));
        }
    }

    /**
     * Handles the global mousedown event. If the target element is not within the
     * popup, it dispatches a custom event with the name "popup-close".
     * @param {MouseEvent} event - The mousedown event.
     */
    handleOutsideClick(event) {
        if (!this.popup.contains(event.target)) {
            this.dispatchCloseEvent();
        }
    }

    /**
     * Dispatches a "popup-close" custom event.
     *
     * This method creates and dispatches a custom event named "popup-close"
     * with a detail object containing a message indicating that the popup
     * has been closed.
     */
    dispatchCloseEvent() {
        const closeEvent = new CustomEvent("popup-close", {
            detail: { message: "Popup closed" },
        });
        this.popup.dispatchEvent(closeEvent);
    }

    /**
     * Displays the popup at the specified coordinates.
     *
     * This method sets the position of the popup to the given
     * x and y coordinates and makes it visible.
     *
     * @param {number} x - The x-coordinate where the popup should appear.
     * @param {number} y - The y-coordinate where the popup should appear.
     */
    showPopup(x, y) {
        this.popup.style.left = `${x}px`;
        this.popup.style.top = `${y}px`;
        this.popup.style.display = "block";
    }

    /**
     * Hides the popup element.
     *
     * This method sets the display style of the popup to "none",
     * effectively making it invisible. It does not remove the
     * popup from the DOM, allowing it to be shown again later.
     */
    hidePopup() {
        this.popup.style.display = "none";
    }

    /**
     * Starts the drag action of the popup.
     *
     * This method is called when the header element of the popup is clicked.
     * It sets the `isDragging` flag to true and calculates the offset of the
     * popup from the mouse position. It then adds event listeners to the
     * document for mousemove and mouseup events, which will be used to
     * update the position of the popup while dragging.
     *
     * @param {MouseEvent} event - The mousedown event which triggered this action.
     */
    startDrag(event) {
        this.isDragging = true;
        this.offsetX = event.clientX - this.popup.offsetLeft;
        this.offsetY = event.clientY - this.popup.offsetTop;

        document.addEventListener("mousemove", this.drag.bind(this));
        document.addEventListener("mouseup", this.endDrag.bind(this));
    }

    /**
     * Handles the dragging of the popup.
     *
     * This method is called continuously while the user is dragging the popup.
     * It updates the position of the popup based on the current mouse position,
     * while also ensuring that the popup does not move outside of the container.
     *
     * @param {MouseEvent} event - The mousemove event which triggered this action.
     */
    drag(event) {
        if (!this.isDragging) return;

        const containerRect = this.container.getBoundingClientRect();
        const popupRect = this.popup.getBoundingClientRect();

        const x = Math.max(
            containerRect.left,
            Math.min(event.clientX - this.offsetX, containerRect.right - popupRect.width)
        );
        const y = Math.max(
            containerRect.top,
            Math.min(event.clientY - this.offsetY, containerRect.bottom - popupRect.height)
        );

        this.popup.style.left = `${x}px`;
        this.popup.style.top = `${y}px`;
    }

    /**
     * Handles the end of a drag action.
     *
     * This method is called once the user has finished dragging the popup.
     * It sets the isDragging flag to false and removes the event listeners
     * for mousemove and mouseup events.
     */
    endDrag() {
        this.isDragging = false;
        document.removeEventListener("mousemove", this.drag.bind(this));
        document.removeEventListener("mouseup", this.endDrag.bind(this));
    }


    /**
     * Destroys the popup, removing it from the DOM and removing the global
     * event listeners.
     */
    destroy() {
        document.removeEventListener("mousedown", this.handleOutsideClick);
        this.popup.remove();
    }
}

export default PopupManager;
