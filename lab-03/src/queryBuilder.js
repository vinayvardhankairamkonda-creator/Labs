// Builds the SQL for GET /books from already-validated options.
// User input only ever travels in the params array (parameterised query).
// order_by / order are inserted into the string, but ONLY after the
// validator has matched them against a fixed whitelist.

function escapeLike(text) {
  return text.replace(/[\\%_]/g, (ch) => "\\" + ch);
}

function buildListQuery(opts) {
  const where = [];
  const params = [];

  if (opts.search_q) {
    where.push("title LIKE ? ESCAPE '\\'");
    params.push(`%${escapeLike(opts.search_q)}%`);
  }

  if (opts.min_price !== null && opts.max_price !== null) {
    where.push("price BETWEEN ? AND ?");
    params.push(opts.min_price, opts.max_price);
  } else if (opts.min_price !== null) {
    where.push("price >= ?");
    params.push(opts.min_price);
  } else if (opts.max_price !== null) {
    where.push("price <= ?");
    params.push(opts.max_price);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countSql = `SELECT COUNT(*) AS total FROM books ${whereSql}`;
  const countParams = [...params];

  // id as a tie-breaker keeps pagination stable when the sort column has duplicates
  const listSql =
    `SELECT id, title, author, price FROM books ${whereSql} ` +
    `ORDER BY ${opts.order_by} ${opts.order}, id ASC LIMIT ? OFFSET ?`;
  const listParams = [...params, opts.limit, opts.offset];

  return { countSql, countParams, listSql, listParams };
}

module.exports = { buildListQuery, escapeLike };
