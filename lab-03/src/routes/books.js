const express = require("express");
const { validateBookBody, validateId, validateListQuery } = require("../validators");
const { buildListQuery } = require("../queryBuilder");

// Every error response has the same shape: { "message": "..." }
function fail(res, status, message) {
  return res.status(status).json({ message });
}

module.exports = function booksRouter(db) {
  const router = express.Router();

  // GET /books  -> list with search, sort, price range and pagination
  router.get("/", async (req, res, next) => {
    try {
      const parsed = validateListQuery(req.query);
      if (parsed.error) return fail(res, 400, parsed.error);

      const q = buildListQuery(parsed.value);
      const { total } = await db.get(q.countSql, q.countParams);
      const books = await db.all(q.listSql, q.listParams);

      res.status(200).json({
        total,
        limit: parsed.value.limit,
        offset: parsed.value.offset,
        books,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /books/:id  -> one book
  router.get("/:id", async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      if (id.error) return fail(res, 400, id.error);

      const book = await db.get("SELECT id, title, author, price FROM books WHERE id = ?", [id.value]);
      if (!book) return fail(res, 404, `Book with id ${id.value} not found`);

      res.status(200).json(book);
    } catch (err) {
      next(err);
    }
  });

  // POST /books  -> create (201)
  router.post("/", async (req, res, next) => {
    try {
      const parsed = validateBookBody(req.body);
      if (parsed.error) return fail(res, 400, parsed.error);

      const { title, author, price } = parsed.value;
      const result = await db.run("INSERT INTO books (title, author, price) VALUES (?, ?, ?)", [title, author, price]);

      res.status(201).json({
        message: "Book created",
        book: { id: result.lastID, title, author, price },
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /books/:id  -> replace title, author and price (200)
  router.put("/:id", async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      if (id.error) return fail(res, 400, id.error);

      const parsed = validateBookBody(req.body);
      if (parsed.error) return fail(res, 400, parsed.error);

      const existing = await db.get("SELECT id FROM books WHERE id = ?", [id.value]);
      if (!existing) return fail(res, 404, `Book with id ${id.value} not found`);

      const { title, author, price } = parsed.value;
      await db.run("UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?", [title, author, price, id.value]);

      res.status(200).json({
        message: "Book updated",
        book: { id: id.value, title, author, price },
      });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /books/:id  -> remove (200)
  router.delete("/:id", async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      if (id.error) return fail(res, 400, id.error);

      const result = await db.run("DELETE FROM books WHERE id = ?", [id.value]);
      if (result.changes === 0) return fail(res, 404, `Book with id ${id.value} not found`);

      res.status(200).json({ message: "Book deleted" });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
