const path = require("path");
const os = require("os");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const SEED_BOOKS = [
  ["Clean Code", "Robert C. Martin", 450],
  ["The Pragmatic Programmer", "Andrew Hunt", 520],
  ["Eloquent JavaScript", "Marijn Haverbeke", 399],
  ["You Don't Know JS", "Kyle Simpson", 350],
  ["Node.js Design Patterns", "Mario Casciaro", 780],
  ["Designing Data-Intensive Applications", "Martin Kleppmann", 899],
  ["Refactoring", "Martin Fowler", 650],
  ["JavaScript: The Good Parts", "Douglas Crockford", 299],
  ["Learning SQL", "Alan Beaulieu", 420],
  ["HTTP: The Definitive Guide", "David Gourley", 560],
  ["Introduction to Algorithms", "Thomas H. Cormen", 950],
  ["Code Complete", "Steve McConnell", 700],
];

async function initDb() {
  const defaultDbPath = process.env.VERCEL
    ? path.join(os.tmpdir(), "books.db")
    : "./books.db";
  const dbPath = path.resolve(process.env.DB_PATH || defaultDbPath);
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      title  TEXT NOT NULL,
      author TEXT NOT NULL,
      price  REAL NOT NULL CHECK (price >= 0)
    );
  `);

  const { count } = await db.get("SELECT COUNT(*) AS count FROM books");
  if (count === 0) {
    for (const [title, author, price] of SEED_BOOKS) {
      await db.run("INSERT INTO books (title, author, price) VALUES (?, ?, ?)", [title, author, price]);
    }
  }

  return db;
}

module.exports = { initDb, SEED_BOOKS };
