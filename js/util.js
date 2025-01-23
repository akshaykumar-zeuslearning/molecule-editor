export function getSvgCoordinates(event, rect) {
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}

export function isWithinRadius(x1, y1, x2, y2, radius) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
}

export function formatSubscript(text) {
    return text.replace(/(\d+)/g, "<sub>$1</sub>");
}

export function parseSubscriptText(text) {
    const regex = /([A-Za-z]+)(\d*)/g;
    const parts = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        parts.push({ base: match[1], sub: match[2] || "" });
    }

    return parts;
}
