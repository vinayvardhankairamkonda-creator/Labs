// Run with: npm test
// Tests the validation rules and the generated SQL without starting the server.
// Uses Node's built-in node:sqlite (Node 22+), so no extra packages are needed.
const test = require("node:test");
const assert = require("node:assert");
const { validateBookBody, validateId, validateListQuery } = require("../src/validators");
const { buildListQuery } = require("../src/queryBuilder");

let DatabaseSync;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch (e) {
  DatabaseSync = null;
}

// ---------- body validation ----------
test("POST body: valid book passes", () => {
  const r = validateBookBody({ title: " Clean Code ", author: "Robert Martin", price: 450 });
  assert.deepStrictEqual(r.value, { title: "Clean Code", author: "Robert Martin", price: 450 });
});

test("POST body: numeric string price is accepted", () => {
  assert.strictEqual(validateBookBody({ title: "A", author: "B", price: "99.5" }).value.price, 99.5);
});

test("POST body: missing title / author / price are rejected", () => {
  assert.ok(validateBookBody({ author: "B", price: 1 }).error.includes("title"));
  assert.ok(validateBookBody({ title: "A", price: 1 }).error.includes("author"));
  assert.ok(validateBookBody({ title: "A", author: "B" }).error.includes("price"));
});

test("POST body: blank title and non-numeric price are rejected", () => {
  assert.ok(validateBookBody({ title: "   ", author: "B", price: 1 }).error);
  assert.ok(validateBookBody({ title: "A", author: "B", price: "abc" }).error.includes("number"));
  assert.ok(validateBookBody({ title: "A", author: "B", price: true }).error.includes("number"));
  assert.ok(validateBookBody({ title: "A", author: "B", price: -5 }).error.includes("negative"));
});

test("POST body: non-object body is rejected", () => {
  assert.ok(validateBookBody(undefined).error);
  assert.ok(validateBookBody([]).error);
});

// ---------- id ----------
test("id validation", () => {
  assert.strictEqual(validateId("7").value, 7);
  assert.ok(validateId("abc").error);
  assert.ok(validateId("0").error);
  assert.ok(validateId("-3").error);
  assert.ok(validateId("1.5").error);
});

// ---------- query parameters ----------
test("GET query: defaults are applied", () => {
  const r = validateListQuery({});
  assert.deepStrictEqual(r.value, {
    search_q: "", order_by: "id", order: "ASC", limit: 10, offset: 0, min_price: null, max_price: null,
  });
});

test("GET query: bad values are rejected", () => {
  assert.ok(validateListQuery({ order_by: "password" }).error);
  assert.ok(validateListQuery({ order_by: "price; DROP TABLE books" }).error);
  assert.ok(validateListQuery({ order: "sideways" }).error);
  assert.ok(validateListQuery({ limit: "0" }).error);
  assert.ok(validateListQuery({ limit: "101" }).error);
  assert.ok(validateListQuery({ limit: "ten" }).error);
  assert.ok(validateListQuery({ offset: "-1" }).error);
  assert.ok(validateListQuery({ min_price: "cheap" }).error);
  assert.ok(validateListQuery({ min_price: "500", max_price: "100" }).error);
  assert.ok(validateListQuery({ search_q: ["a", "b"] }).error); // ?search_q=a&search_q=b
});

test("GET query: case-insensitive order values are normalised", () => {
  const r = validateListQuery({ order_by: "PRICE", order: "desc" });
  assert.strictEqual(r.value.order_by, "price");
  assert.strictEqual(r.value.order, "DESC");
});

// ---------- generated SQL, run against a real in-memory database ----------
const skipDb = DatabaseSync ? false : "node:sqlite not available in this Node version";

function makeDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, author TEXT, price REAL)");
  const ins = db.prepare("INSERT INTO books (title, author, price) VALUES (?, ?, ?)");
  [
    ["Clean Code", "Martin", 450],
    ["Clean Architecture", "Martin", 500],
    ["Refactoring", "Fowler", 650],
    ["100% Pure SQL", "Someone", 300],
    ["Learning SQL", "Beaulieu", 420],
  ].forEach((row) => ins.run(...row));
  return db;
}

function run(db, query) {
  const opts = validateListQuery(query).value;
  const q = buildListQuery(opts);
  return {
    total: db.prepare(q.countSql).get(...q.countParams).total,
    rows: db.prepare(q.listSql).all(...q.listParams),
  };
}

test("SQL: search_q does a partial title match", { skip: skipDb }, () => {
  const { total, rows } = run(makeDb(), { search_q: "clean" });
  assert.strictEqual(total, 2);
  assert.deepStrictEqual(rows.map((r) => r.title), ["Clean Code", "Clean Architecture"]);
});

test("SQL: % in search_q is treated as a normal character", { skip: skipDb }, () => {
  const { rows } = run(makeDb(), { search_q: "%" });
  assert.deepStrictEqual(rows.map((r) => r.title), ["100% Pure SQL"]);
});

test("SQL: sorting and pagination", { skip: skipDb }, () => {
  const db = makeDb();
  const first = run(db, { order_by: "price", order: "DESC", limit: "2" });
  assert.deepStrictEqual(first.rows.map((r) => r.price), [650, 500]);
  assert.strictEqual(first.total, 5); // total ignores limit
  const second = run(db, { order_by: "price", order: "DESC", limit: "2", offset: "2" });
  assert.deepStrictEqual(second.rows.map((r) => r.price), [450, 420]);
});

test("SQL: price range filters", { skip: skipDb }, () => {
  const db = makeDb();
  assert.strictEqual(run(db, { min_price: "400", max_price: "500" }).total, 3);
  assert.strictEqual(run(db, { min_price: "600" }).total, 1);
  assert.strictEqual(run(db, { max_price: "300" }).total, 1);
});

test("SQL: filters combine with AND", { skip: skipDb }, () => {
  const { rows } = run(makeDb(), { search_q: "sql", max_price: "400" });
  assert.deepStrictEqual(rows.map((r) => r.title), ["100% Pure SQL"]);
});

test("SQL: injection attempt in search_q is just text", { skip: skipDb }, () => {
  const db = makeDb();
  const { total } = run(db, { search_q: "' OR 1=1 --" });
  assert.strictEqual(total, 0);
  assert.strictEqual(db.prepare("SELECT COUNT(*) AS c FROM books").get().c, 5);
});
