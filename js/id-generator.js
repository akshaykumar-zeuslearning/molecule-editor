let id = 0;
export function generateId() {
    return String(id++);
}

export function resetId() {
    id = String(0);
}
