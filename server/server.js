import https from "https";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIp() {
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }

  return "localhost";
}

const ip = getLocalIp();
const webRoot = path.resolve(__dirname, "../web");

const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
  },
  (req, res) => {
    const requestedPath = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(webRoot, requestedPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath);
      const type = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript"
      }[ext] || "text/plain";

      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    });
  }
);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "control") {
      console.log(`${data.id}: ${data.value}`);
    }
  });
});

server.listen(8443, "0.0.0.0", () => {
  console.log(`OpenFlightTouch HTTPS running at: https://${ip}:8443`);
});
