require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── DB connection ──────────────────────────────────────────
const db = mysql.createConnection({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'rahulpujar@190805',
  database: process.env.DB_NAME     || 'quickcanteen',
  multipleStatements: true,
});

db.connect((err) => {
  if (err) { console.error('❌ MySQL connection error:', err.message); return; }
  console.log('✅ Connected to MySQL database!');
  createTables();
});

// ── Create tables & seed ───────────────────────────────────
function createTables() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id       INT AUTO_INCREMENT PRIMARY KEY,
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
      items          JSON,
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
      id           INT AUTO_INCREMENT PRIMARY KEY,
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

  db.query(usersTable, (err) => {
    if (err) { console.error('Error creating users table:', err.message); return; }
    seedUsers();
  });

  db.query(ordersTable, (err) => {
    if (err) console.error('Error creating orders table:', err.message);
  });

  db.query(menuTable, (err) => {
    if (err) { console.error('Error creating menu_items table:', err.message); return; }
    seedMenu();
  });
}

function seedUsers() {
  // Always ensure the correct admin account exists using INSERT IGNORE
  // (INSERT IGNORE skips if email already exists, inserts if it doesn't)
  const ensureAdmin = () => {
    db.query(
      'INSERT IGNORE INTO users (name, email, password, phone, role) VALUES (?,?,?,?,?)',
      ['Rahul Vasant Pujar', 'rahulpujar1908@gmail.com', 'mental@1908', '9000000001', 'admin'],
      (err) => {
        if (err) console.error('Error ensuring admin user:', err.message);
        else     console.log('✅ Admin user ready: rahulpujar1908@gmail.com');
      }
    );
    // Also ensure staff and student demo accounts
    db.query('INSERT IGNORE INTO users (name, email, password, phone, role) VALUES (?,?,?,?,?)',
      ['Staff One', 'staff@qc.com', 'staff123', '9000000002', 'staff'], () => {});
    db.query('INSERT IGNORE INTO users (name, email, password, phone, role) VALUES (?,?,?,?,?)',
      ['Demo Student', 'student@qc.com', 'student123', '9000000003', 'student'], () => {});
  };

  db.query('SELECT COUNT(*) AS count FROM users', (err, result) => {
    if (err) { ensureAdmin(); return; }
    ensureAdmin(); // always run to cover migration from old credentials
  });
}

function seedMenu() {
  db.query('SELECT COUNT(*) AS count FROM menu_items', (err, result) => {
    if (err) return;
    if (result[0].count === 0) {
      const sql = 'INSERT INTO menu_items (name, category, price, qty, veg, emoji, prep, rating, description) VALUES ?';
      const items = [
        ['Idli Sambar',               'Breakfast', 20,  100, 1, '🍛', 5,  4.5, 'Soft steamed idlis with spiced sambar & chutneys'],
        ['Poha',                      'Breakfast', 25,  80,  1, '🍚', 7,  4.2, 'Flattened rice with onions, mustard seeds & coriander'],
        ['Masala Dosa',               'Breakfast', 35,  60,  1, '🫓', 10, 4.8, 'Crispy dosa filled with spiced potato masala'],
        ['Veg Thali',                 'Lunch',     60,  50,  1, '🍱', 15, 4.6, 'Complete meal: rice, dal, sabzi, roti, pickle & papad'],
        ['Chicken Curry Rice',        'Lunch',     80,  40,  0, '🍗', 20, 4.7, 'Spiced chicken curry served over steamed basmati rice'],
        ['Paneer Butter Masala+Roti', 'Lunch',     70,  45,  1, '🧆', 18, 4.5, 'Creamy paneer in tomato-butter gravy with 2 rotis'],
        ['Samosa',                    'Snacks',    10,  200, 1, '🥟', 3,  4.3, 'Crispy pastry filled with spiced potato & peas'],
        ['Bread Omelette',            'Snacks',    30,  60,  0, '🍳', 5,  4.1, 'Fluffy egg omelette with toast, veggies & cheese'],
        ['Veg Sandwich',              'Snacks',    25,  90,  1, '🥪', 5,  4.0, 'Grilled sandwich with cucumber, tomato & mint chutney'],
        ['Tea',                       'Beverages', 8,   300, 1, '☕', 2,  4.4, 'Masala chai brewed with ginger, cardamom & milk'],
        ['Cold Coffee',               'Beverages', 35,  100, 1, '🧋', 5,  4.6, 'Blended cold coffee with milk, sugar & ice'],
        ['Lassi',                     'Beverages', 25,  120, 1, '🥛', 3,  4.5, 'Sweet chilled yogurt drink, plain or with rose'],
      ];
      db.query(sql, [items], (err) => {
        if (err) console.error('Error seeding menu:', err.message);
        else     console.log('✅ Menu items seeded');
      });
    }
  });
}

// ── AUTH ROUTES ────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required' });
  db.query('SELECT * FROM users WHERE email=? AND password=?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) res.json({ success:true, user: results[0] });
    else res.status(401).json({ success:false, message:'Invalid email or password' });
  });
});

app.post('/api/register', (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error:'Name, email and password required' });
  db.query(
    'INSERT INTO users (name, email, password, phone, role) VALUES (?,?,?,?,?)',
    [name, email, password, phone || '', role || 'student'],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error:'Email already exists' });
        return res.status(500).json({ error: err.message });
      }
      res.json({ success:true, userId: result.insertId });
    }
  );
});

// ── ORDER ROUTES ───────────────────────────────────────────
app.get('/api/orders', (_req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const orders = rows.map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
    }));
    res.json(orders);
  });
});

app.post('/api/orders', (req, res) => {
  const { id, user_name, items, total, status, pickup_time, payment_method, token, order_date, order_time } = req.body;
  db.query(
    'INSERT INTO orders (id,user_name,items,total,status,pickup_time,payment_method,token,order_date,order_time) VALUES (?,?,?,?,?,?,?,?,?,?)',
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
  db.query('UPDATE orders SET status=? WHERE id=?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success:true });
  });
});

// ── MENU ROUTES ────────────────────────────────────────────
app.get('/api/menu', (_req, res) => {
  db.query('SELECT * FROM menu_items ORDER BY category, name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/menu', (req, res) => {
  const { name, category, price, qty, veg, emoji, prep, description } = req.body;
  db.query(
    'INSERT INTO menu_items (name,category,price,qty,veg,emoji,prep,description) VALUES (?,?,?,?,?,?,?,?)',
    [name, category, price, qty||0, veg?1:0, emoji||'🍽️', prep||5, description||''],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success:true, id: result.insertId });
    }
  );
});

app.put('/api/menu/:id', (req, res) => {
  const { name, category, price, qty, veg, emoji, prep, description } = req.body;
  db.query(
    'UPDATE menu_items SET name=?,category=?,price=?,qty=?,veg=?,emoji=?,prep=?,description=? WHERE id=?',
    [name, category, price, qty, veg?1:0, emoji, prep, description||'', req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success:true });
    }
  );
});

app.delete('/api/menu/:id', (req, res) => {
  db.query('DELETE FROM menu_items WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success:true });
  });
});

app.patch('/api/menu/:id/stock', (req, res) => {
  const { qty } = req.body;
  db.query('UPDATE menu_items SET qty=? WHERE id=?', [qty, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success:true });
  });
});

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status:'ok', time: new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
