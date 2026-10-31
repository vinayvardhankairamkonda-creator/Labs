const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}/`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const isValidId = (value) => /^\d+$/.test(String(value));
const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
const isNonNegativeInt = (v) => Number.isInteger(v) && v >= 0;

const validateBook = (body) => {
  const { title, author, price, pages } = body || {};
  if (!isNonEmptyString(title)) return "title must be a non-empty string";
  if (!isNonEmptyString(author)) return "author must be a non-empty string";
  if (!isNonNegativeInt(price)) return "price must be a non-negative integer";
  if (!isNonNegativeInt(pages)) return "pages must be a non-negative integer";
  return null;
};

// 1. Get all books
app.get("/books/", async (request, response) => {
  try {
    const books = await db.all("SELECT * FROM book ORDER BY id;");
    response.status(200).send(books);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// 2. Get one book
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) {
    return response.status(400).send({ error: "bookId must be a positive integer" });
  }
  try {
    const book = await db.get("SELECT * FROM book WHERE id = ?;", [bookId]);
    if (book === undefined) {
      return response.status(404).send({ error: "Book not found" });
    }
    response.status(200).send(book);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// 3. Add a book
app.post("/books/", async (request, response) => {
  const errorMessage = validateBook(request.body);
  if (errorMessage) {
    return response.status(400).send({ error: errorMessage });
  }
  const { title, author, price, pages } = request.body;
  try {
    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);",
      [title.trim(), author.trim(), price, pages]
    );
    response.status(201).send({ bookId: result.lastID, message: "Book added successfully" });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// 4. Update a book
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) {
    return response.status(400).send({ error: "bookId must be a positive integer" });
  }
  const errorMessage = validateBook(request.body);
  if (errorMessage) {
    return response.status(400).send({ error: errorMessage });
  }
  const { title, author, price, pages } = request.body;
  try {
    const result = await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;",
      [title.trim(), author.trim(), price, pages, bookId]
    );
    if (result.changes === 0) {
      return response.status(404).send({ error: "Book not found" });
    }
    response.status(200).send({ message: "Book updated successfully" });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// 5. Delete a book
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) {
    return response.status(400).send({ error: "bookId must be a positive integer" });
  }
  try {
    const result = await db.run("DELETE FROM book WHERE id = ?;", [bookId]);
    if (result.changes === 0) {
      return response.status(404).send({ error: "Book not found" });
    }
    response.status(200).send({ message: "Book deleted successfully" });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});
