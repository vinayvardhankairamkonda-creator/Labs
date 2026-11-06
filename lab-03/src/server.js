require("dotenv").config();
const express = require("express");
const { initDb } = require("./db");
const booksRouter = require("./routes/books");

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const db = await initDb();
  const app = express();

  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Books API is running. Try GET /books" });
  });

  app.use("/books", booksRouter(db));

  // Unknown route -> 404 in the same { message } format
  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
  });

  // Error handler: malformed JSON -> 400, anything else -> 500 (details stay in the server log)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ message: "Request body is not valid JSON" });
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  // Friendly message for the classic port conflict
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other process or set a different PORT in .env`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
