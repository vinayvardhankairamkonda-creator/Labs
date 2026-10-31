CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  author TEXT,
  price INTEGER,
  pages INTEGER
);

INSERT INTO book (title, author, price, pages) VALUES
  ('The Alchemist', 'Paulo Coelho', 299, 208),
  ('Wings of Fire', 'A. P. J. Abdul Kalam', 250, 180),
  ('The Guide', 'R. K. Narayan', 325, 220),
  ('Malgudi Days', 'R. K. Narayan', 275, 256),
  ('The White Tiger', 'Aravind Adiga', 399, 321),
  ('Train to Pakistan', 'Khushwant Singh', 280, 181),
  ('The God of Small Things', 'Arundhati Roy', 450, 340),
  ('Godan', 'Munshi Premchand', 220, 350),
  ('Gitanjali', 'Rabindranath Tagore', 180, 120),
  ('Midnight''s Children', 'Salman Rushdie', 499, 536);
