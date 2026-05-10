import { sendControl } from "../core/websocket.js";

export function createNumberControl(control) {
  const section = document.createElement("section");
  section.className = "control-card";

  const title = document.createElement("h1");
  title.textContent = control.label.toUpperCase();

  const valueDisplay = document.createElement("div");
  valueDisplay.className = "value-display";
  valueDisplay.textContent = control.defaultValue;

  const buttons = document.createElement("div");
  buttons.className = "number-stack";

  for (let value = control.max; value >= control.min; value -= control.step) {
    const button = document.createElement("button");
    button.textContent = value > 0 ? `+${value}` : String(value);
    button.dataset.value = value;

    button.addEventListener("click", () => {
      valueDisplay.textContent = button.textContent;
      sendControl(control.id, value);
    });

    buttons.appendChild(button);
  }

  const centerButton = document.createElement("button");
  centerButton.className = "center-button";
  centerButton.textContent = "CENTER";

  centerButton.addEventListener("click", () => {
    valueDisplay.textContent = "0";
    sendControl(control.id, 0);
  });

  section.append(title, valueDisplay, buttons, centerButton);
  return section;
}
