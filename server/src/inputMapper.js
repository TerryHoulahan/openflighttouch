import { execFile } from "child_process";

function tapKey(key) {
  execFile("xdotool", ["key", key], (error) => {
    if (error) {
      console.error("xdotool error:", error.message);
    }
  });
}

function handlePitch(value) {
  const numericValue = Number(value);
  const amount = Math.min(5, Math.abs(numericValue));

  if (amount === 0) return;

  const key = numericValue > 0 ? "2" : "8";

  for (let i = 0; i < amount; i += 1) {
    setTimeout(() => tapKey(key), i * 80);
  }
}

export function handleControl(data) {
  if (data.id === "pitch") {
    handlePitch(data.value);
  }
}
