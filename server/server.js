import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Config: choose Supabase if configured, otherwise fallback to SQLite
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

let supabase = null;
if (USE_SUPABASE) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  console.log('Using Supabase as the database backend');
}

// SQLite fallback setup
let db = null;
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

if (!USE_SUPABASE) {
  const dbPath = path.join(__dirname, 'data.db');
  db = new Database(dbPath);
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
  console.log('Using local SQLite as the database backend');
}

// API routes
app.get('/api/products', async (req, res) => {
  try {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('dateAdded', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data || []);
    } else {
      const rows = db.prepare('SELECT * FROM products ORDER BY dateAdded DESC').all();
      return res.json(rows.map(rowToProduct));
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, images, desc, type } = req.body || {};
    if (!name || typeof price !== 'number' || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const id = Date.now();
    const payload = {
      id,
      name,
      price,
      images: images.slice(0, 4),
      desc: desc || '',
      type: type || 'normal',
      dateAdded: Date.now()
    };

    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    } else {
      const stmt = db.prepare(
        'INSERT INTO products (id, name, price, images, desc, type, dateAdded) VALUES (@id, @name, @price, @images, @desc, @type, @dateAdded)'
      );
      stmt.run({ ...payload, images: JSON.stringify(payload.images) });
      const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      return res.status(201).json(rowToProduct(row));
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price, images, desc, type } = req.body || {};

    if (USE_SUPABASE) {
      const { data: existsData, error: existsErr } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      if (existsErr) return res.status(500).json({ error: existsErr.message });
      if (!existsData) return res.status(404).json({ error: 'Not found' });

      const { data, error } = await supabase
        .from('products')
        .update({ name, price, images: Array.isArray(images) ? images.slice(0, 4) : [], desc: desc || '', type: type || 'normal' })
        .eq('id', id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    } else {
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
      return res.json(rowToProduct(row));
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true });
    } else {
      const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
      if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
      return res.json({ ok: true });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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