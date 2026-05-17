require('dotenv').config();
const express = require('express');
const { Pool }  = require('pg');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── DB connection ──────────────────────────────────────────
// Supabase uses a generic PostgreSQL connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

pool.connect((err, client, release) => {
  if (err) { console.error('❌ PostgreSQL connection error:', err.message); return; }
  console.log('✅ Connected to Supabase PostgreSQL database!');
  if (release) release();
  createTables();
});

// ── Create tables & seed ───────────────────────────────────
function createTables() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id       SERIAL PRIMARY KEY,
      name     VARCHAR(255) NOT NULL,
      email    VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone    VARCHAR(20),
      role     VARCHAR(50) DEFAULT 'student'
    )`;

  const ordersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id             INT PRIMARY KEY,
      user_name      VARCHAR(255),
      items          JSONB,
      total          DECIMAL(10,2),
      status         VARCHAR(50) DEFAULT 'PENDING',
      pickup_time    VARCHAR(20),
      payment_method VARCHAR(50),
      token          INT,
      order_date     VARCHAR(50),
      order_time     VARCHAR(20),
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  const menuTable = `
    CREATE TABLE IF NOT EXISTS menu_items (
      id           SERIAL PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      category     VARCHAR(100),
      price        DECIMAL(10,2) NOT NULL,
      qty          INT DEFAULT 0,
      veg          BOOLEAN DEFAULT TRUE,
      emoji        VARCHAR(20),
      prep         INT DEFAULT 5,
      rating       DECIMAL(3,1) DEFAULT 4.0,
      description  TEXT,
      is_available BOOLEAN DEFAULT TRUE
    )`;

  pool.query(usersTable, (err) => {
    if (err) { console.error('Error creating users table:', err.message); return; }
    seedUsers();
  });

  pool.query(ordersTable, (err) => {
    if (err) console.error('Error creating orders table:', err.message);
  });

  pool.query(menuTable, (err) => {
    if (err) { console.error('Error creating menu_items table:', err.message); return; }
    seedMenu();
  });
}

function seedUsers() {
  const ensureAdmin = () => {
    pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING',
      ['Rahul Vasant Pujar', 'rahulpujar1908@gmail.com', 'mental@1908', '9000000001', 'admin'],
      (err) => {
        if (err) console.error('Error ensuring admin user:', err.message);
        else     console.log('✅ Admin user ready: rahulpujar1908@gmail.com');
      }
    );
    // Also ensure staff and student demo accounts
    pool.query('INSERT INTO users (name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING',
      ['Staff One', 'staff@qc.com', 'staff123', '9000000002', 'staff'], () => {});
    pool.query('INSERT INTO users (name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING',
      ['Demo Student', 'student@qc.com', 'student123', '9000000003', 'student'], () => {});
  };

  pool.query('SELECT COUNT(*) AS count FROM users', (err, result) => {
    if (err) { ensureAdmin(); return; }
    ensureAdmin();
  });
}

function seedMenu() {
  pool.query('SELECT COUNT(*) AS count FROM menu_items', (err, result) => {
    if (err) return;
    if (parseInt(result.rows[0].count) === 0) {
      const items = [
        ['Idli Sambar',               'Breakfast', 20,  100, true, '🍛', 5,  4.5, 'Soft steamed idlis with spiced sambar & chutneys'],
        ['Poha',                      'Breakfast', 25,  80,  true, '🍚', 7,  4.2, 'Flattened rice with onions, mustard seeds & coriander'],
        ['Masala Dosa',               'Breakfast', 35,  60,  true, '🫓', 10, 4.8, 'Crispy dosa filled with spiced potato masala'],
        ['Veg Thali',                 'Lunch',     60,  50,  true, '🍱', 15, 4.6, 'Complete meal: rice, dal, sabzi, roti, pickle & papad'],
        ['Chicken Curry Rice',        'Lunch',     80,  40,  false, '🍗', 20, 4.7, 'Spiced chicken curry served over steamed basmati rice'],
        ['Paneer Butter Masala+Roti', 'Lunch',     70,  45,  true, '🧆', 18, 4.5, 'Creamy paneer in tomato-butter gravy with 2 rotis'],
        ['Samosa',                    'Snacks',    10,  200, true, '🥟', 3,  4.3, 'Crispy pastry filled with spiced potato & peas'],
        ['Bread Omelette',            'Snacks',    30,  60,  false, '🍳', 5,  4.1, 'Fluffy egg omelette with toast, veggies & cheese'],
        ['Veg Sandwich',              'Snacks',    25,  90,  true, '🥪', 5,  4.0, 'Grilled sandwich with cucumber, tomato & mint chutney'],
        ['Tea',                       'Beverages', 8,   300, true, '☕', 2,  4.4, 'Masala chai brewed with ginger, cardamom & milk'],
        ['Cold Coffee',               'Beverages', 35,  100, true, '🧋', 5,  4.6, 'Blended cold coffee with milk, sugar & ice'],
        ['Lassi',                     'Beverages', 25,  120, true, '🥛', 3,  4.5, 'Sweet chilled yogurt drink, plain or with rose'],
      ];
      
      let pending = items.length;
      items.forEach(item => {
        pool.query(
          'INSERT INTO menu_items (name, category, price, qty, veg, emoji, prep, rating, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          item,
          (err) => {
            if (err) console.error('Error seeding menu item:', err.message);
            pending--;
            if (pending === 0) console.log('✅ Menu items seeded');
          }
        );
      });
    }
  });
}

// ── AUTH ROUTES ────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required' });
  pool.query('SELECT * FROM users WHERE email=$1 AND password=$2', [email, password], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.rows.length > 0) res.json({ success:true, user: result.rows[0] });
    else res.status(401).json({ success:false, message:'Invalid email or password' });
  });
});

app.post('/api/register', (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error:'Name, email and password required' });
  pool.query(
    'INSERT INTO users (name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [name, email, password, phone || '', role || 'student'],
    (err, result) => {
      if (err) {
        if (err.code === '23505') return res.status(409).json({ error:'Email already exists' });
        return res.status(500).json({ error: err.message });
      }
      res.json({ success:true, userId: result.rows[0].id });
    }
  );
});

// ── ORDER ROUTES ───────────────────────────────────────────
app.get('/api/orders', (_req, res) => {
  pool.query('SELECT * FROM orders ORDER BY created_at DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const orders = result.rows.map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
    }));
    res.json(orders);
  });
});

app.post('/api/orders', (req, res) => {
  const { id, user_name, items, total, status, pickup_time, payment_method, token, order_date, order_time } = req.body;
  pool.query(
    'INSERT INTO orders (id,user_name,items,total,status,pickup_time,payment_method,token,order_date,order_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [id, user_name, JSON.stringify(items), total, status||'PENDING', pickup_time, payment_method, token, order_date, order_time],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success:true });
    }
  );
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error:'Status required' });
  pool.query('UPDATE orders SET status=$1 WHERE id=$2', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success:true });
  });
});

// ── MENU ROUTES ────────────────────────────────────────────
app.get('/api/menu', (_req, res) => {
  pool.query('SELECT * FROM menu_items ORDER BY category, name', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows);
  });
});

app.post('/api/menu', (req, res) => {
  const { name, category, price, qty, veg, emoji, prep, description } = req.body;
  pool.query(
    'INSERT INTO menu_items (name,category,price,qty,veg,emoji,prep,description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
    [name, category, price, qty||0, veg?true:false, emoji||'🍽️', prep||5, description||''],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success:true, id: result.rows[0].id });
    }
  );
});

app.put('/api/menu/:id', (req, res) => {
  const { name, category, price, qty, veg, emoji, prep, description } = req.body;
  pool.query(
    'UPDATE menu_items SET name=$1,category=$2,price=$3,qty=$4,veg=$5,emoji=$6,prep=$7,description=$8 WHERE id=$9',
    [name, category, price, qty, veg?true:false, emoji, prep, description||'', req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success:true });
    }
  );
});

app.delete('/api/menu/:id', (req, res) => {
  pool.query('DELETE FROM menu_items WHERE id=$1', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success:true });
  });
});

app.patch('/api/menu/:id/stock', (req, res) => {
  const { qty } = req.body;
  pool.query('UPDATE menu_items SET qty=$1 WHERE id=$2', [qty, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success:true });
  });
});

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status:'ok', time: new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));