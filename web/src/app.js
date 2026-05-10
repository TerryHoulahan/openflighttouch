import { controls } from "./config/controls.js";
import { connectSocket } from "./core/websocket.js";
import { createNumberControl } from "./components/NumberControl.js";

const app = document.getElementById("app");

const status = document.createElement("div");
status.id = "status";
status.textContent = "Disconnected";

app.appendChild(status);

connectSocket((message) => {
  status.textContent = message;
});

for (const control of controls) {
  if (control.type === "vertical-number-control") {
    app.appendChild(createNumberControl(control));
  }
}
