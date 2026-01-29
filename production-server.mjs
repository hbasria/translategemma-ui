import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeRequest, sendNodeResponse } from "srvx/node";
import handler from "./dist/server/server.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const clientDir = resolve(__dirname, "dist", "client");
const clientDirWithSep = clientDir + sep;

const httpServer = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    // Serve static assets from dist/client
    if (url.pathname.startsWith("/assets/")) {
      const filePath = normalize(join(clientDir, url.pathname));

      // Prevent path traversal
      if (!filePath.startsWith(clientDirWithSep) && filePath !== clientDir) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden");
        return;
      }

      try {
        const content = await readFile(filePath);
        const ext = extname(filePath);
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        });
        res.end(content);
        return;
      } catch (err) {
        if (err.code === "ENOENT") {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        } else {
          throw err;
        }
        return;
      }
    }

    // Handle SSR for all other routes
    const request = new NodeRequest({ req, res });
    const response = await handler(request);
    await sendNodeResponse(res, response);
  } catch (error) {
    console.error("Request error:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

httpServer.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
