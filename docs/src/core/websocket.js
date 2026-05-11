let socket = null;

export function connectSocket(onStatusChange) {
    const host = window.location.hostname;
    socket = new WebSocket(`wss://192.168.0.45:8443`);
    socket.onopen = () => onStatusChange("Connected");
    socket.onclose = () => {
        onStatusChange("Disconnected");
        setTimeout(() => connectSocket(onStatusChange), 1000);
    };

    return socket;
}

export function sendControl(id, value) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({
                               type: "control",
                               id,
                               value: Number(value)
    }));
}
