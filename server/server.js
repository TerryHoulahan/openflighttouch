import https from "https";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { handleControl } from "./src/inputMapper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8443;
const HOST = "0.0.0.0";

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

function getContentType(filePath) {
  const ext = path.extname(filePath);

  return {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
  }[ext] || "text/plain";
}

function safeJoin(root, requestPath) {
  const cleanPath = requestPath === "/" ? "/index.html" : requestPath;
  const decodedPath = decodeURIComponent(cleanPath);
  const filePath = path.normalize(path.join(root, decodedPath));

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

// GitHub Pages uses /docs now, but keep /web fallback for old local structure.
const ip = getLocalIp();
const docsRoot = path.resolve(__dirname, "../docs");
const webRoot = path.resolve(__dirname, "../web");
const staticRoot = fs.existsSync(docsRoot) ? docsRoot : webRoot;

const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
  },
  (req, res) => {
    const filePath = safeJoin(staticRoot, req.url);

    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, { "Content-Type": getContentType(filePath) });
      res.end(data);
    });
  }
);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type !== "control") {
        console.log("Ignoring message:", data);
        return;
      }

      console.log(`${data.id}: ${data.value}`);
      handleControl(data);
    } catch (error) {
      console.error("Invalid message:", error.message);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, HOST, () => {
  console.log(`OpenFlightTouch HTTPS running at: https://${ip}:${PORT}`);
  console.log(`Serving frontend from: ${staticRoot}`);
});
