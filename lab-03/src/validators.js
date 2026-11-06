// Validation helpers. Every function returns { error } or { value }.
// Keeping them free of Express/DB code makes them easy to test.

const ORDER_BY_COLUMNS = ["id", "title", "author", "price"]; // whitelist: column names cannot be parameterised
const ORDER_DIRECTIONS = ["ASC", "DESC"];

const DEFAULTS = { search_q: "", order_by: "id", order: "ASC", limit: 10, offset: 0 };
const MAX_LIMIT = 100;

function isBlank(value) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

// ---------- body (POST / PUT) ----------
function validateBookBody(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object" };
  }

  const { title, author, price } = body;

  if (isBlank(title) || typeof title !== "string") {
    return { error: "title is required and must be a non-empty string" };
  }
  if (isBlank(author) || typeof author !== "string") {
    return { error: "author is required and must be a non-empty string" };
  }
  if (isBlank(price)) {
    return { error: "price is required" };
  }
  if (typeof price === "boolean" || (typeof price !== "number" && typeof price !== "string")) {
    return { error: "price must be a number" };
  }
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) {
    return { error: "price must be a number" };
  }
  if (numericPrice < 0) {
    return { error: "price must not be negative" };
  }

  return { value: { title: title.trim(), author: author.trim(), price: numericPrice } };
}

// ---------- path parameter ----------
function validateId(raw) {
  if (!/^\d+$/.test(String(raw)) || Number(raw) < 1) {
    return { error: "id must be a positive whole number" };
  }
  return { value: Number(raw) };
}

// ---------- query parameters (GET /books) ----------
function parseWholeNumber(raw, name, { min, max }) {
  if (!/^\d+$/.test(String(raw))) {
    return { error: `${name} must be a whole number` };
  }
  const n = Number(raw);
  if (n < min) return { error: `${name} must be at least ${min}` };
  if (max !== undefined && n > max) return { error: `${name} must be at most ${max}` };
  return { value: n };
}

function parsePrice(raw, name) {
  if (isBlank(raw) || !Number.isFinite(Number(raw))) {
    return { error: `${name} must be a number` };
  }
  if (Number(raw) < 0) return { error: `${name} must not be negative` };
  return { value: Number(raw) };
}

function validateListQuery(query) {
  const out = { ...DEFAULTS, min_price: null, max_price: null };

  if (query.search_q !== undefined) {
    if (typeof query.search_q !== "string") return { error: "search_q must be a single text value" };
    out.search_q = query.search_q.trim();
  }

  if (query.order_by !== undefined) {
    const col = String(query.order_by).toLowerCase();
    if (!ORDER_BY_COLUMNS.includes(col)) {
      return { error: `order_by must be one of: ${ORDER_BY_COLUMNS.join(", ")}` };
    }
    out.order_by = col;
  }

  if (query.order !== undefined) {
    const dir = String(query.order).toUpperCase();
    if (!ORDER_DIRECTIONS.includes(dir)) {
      return { error: "order must be ASC or DESC" };
    }
    out.order = dir;
  }

  if (query.limit !== undefined) {
    const r = parseWholeNumber(query.limit, "limit", { min: 1, max: MAX_LIMIT });
    if (r.error) return r;
    out.limit = r.value;
  }

  if (query.offset !== undefined) {
    const r = parseWholeNumber(query.offset, "offset", { min: 0 });
    if (r.error) return r;
    out.offset = r.value;
  }

  if (query.min_price !== undefined) {
    const r = parsePrice(query.min_price, "min_price");
    if (r.error) return r;
    out.min_price = r.value;
  }

  if (query.max_price !== undefined) {
    const r = parsePrice(query.max_price, "max_price");
    if (r.error) return r;
    out.max_price = r.value;
  }

  if (out.min_price !== null && out.max_price !== null && out.min_price > out.max_price) {
    return { error: "min_price must not be greater than max_price" };
  }

  return { value: out };
}

module.exports = {
  ORDER_BY_COLUMNS,
  DEFAULTS,
  MAX_LIMIT,
  validateBookBody,
  validateId,
  validateListQuery,
};
