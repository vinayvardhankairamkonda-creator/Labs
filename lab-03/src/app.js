const express = require("express");
const { initDb } = require("./db");
const booksRouter = require("./routes/books");

async function createApp() {
  const db = await initDb();
  const app = express();

  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Books API is running. Try GET /books" });
  });

  app.use("/books", booksRouter(db));

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ message: "Request body is not valid JSON" });
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}

module.exports = { createApp };
