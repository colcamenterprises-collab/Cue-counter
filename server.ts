import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(process.cwd(), "data.json");

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ users: [], matches: [] }));
  }
}

async function readData() {
  const data = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

async function writeData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  await ensureDataFile();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CueTrack API is running" });
  });

  app.get("/api/data", async (req, res) => {
    try {
      const data = await readData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to read data" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { username, avatarSeed } = req.body;
      const data = await readData();
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        avatarSeed,
        createdAt: Date.now(),
      };
      data.users.push(newUser);
      await writeData(data);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const match = req.body;
      const data = await readData();
      const newMatch = {
        ...match,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      data.matches.push(newMatch);
      await writeData(data);
      res.status(201).json(newMatch);
    } catch (error) {
      res.status(500).json({ error: "Failed to save match" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
