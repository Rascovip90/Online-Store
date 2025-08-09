import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  desc TEXT,
  type TEXT NOT NULL DEFAULT 'normal',
  dateAdded INTEGER NOT NULL
);
`);

function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    images: JSON.parse(row.images || '[]'),
    desc: row.desc || '',
    type: row.type || 'normal',
    dateAdded: row.dateAdded
  };
}

// API routes
app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY dateAdded DESC').all();
  res.json(rows.map(rowToProduct));
});

app.post('/api/products', (req, res) => {
  const { name, price, images, desc, type } = req.body || {};
  if (!name || typeof price !== 'number' || !Array.isArray(images)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const id = Date.now();
  const dateAdded = Date.now();
  const stmt = db.prepare(
    'INSERT INTO products (id, name, price, images, desc, type, dateAdded) VALUES (@id, @name, @price, @images, @desc, @type, @dateAdded)'
  );
  stmt.run({
    id,
    name,
    price,
    images: JSON.stringify(images.slice(0, 4)),
    desc: desc || '',
    type: type || 'normal',
    dateAdded
  });
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json(rowToProduct(row));
});

app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, price, images, desc, type } = req.body || {};
  const exists = db.prepare('SELECT COUNT(1) AS c FROM products WHERE id = ?').get(id).c > 0;
  if (!exists) return res.status(404).json({ error: 'Not found' });
  const stmt = db.prepare(
    'UPDATE products SET name=@name, price=@price, images=@images, desc=@desc, type=@type WHERE id=@id'
  );
  stmt.run({
    id,
    name,
    price,
    images: JSON.stringify(Array.isArray(images) ? images.slice(0, 4) : []),
    desc: desc || '',
    type: type || 'normal'
  });
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json(rowToProduct(row));
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// Serve static files - serve the workspace root to access index.html directly
const staticRoot = path.join(__dirname, '..');
app.use(express.static(staticRoot));

app.get('*', (req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});