/*const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'expense_tracker',
  password: 'Ss123',
  port: 5432,
});


app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express server!' });
});


app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('DB Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const ALLOWED_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other',"grater>20"];

// 1. GET /api/expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, amount::float, category, TO_CHAR(date, 'YYYY-MM-DD') AS date 
       FROM expenses ORDER BY id ASC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/expenses/:id
app.get('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    const result = await pool.query(
      `SELECT id, title, amount::float, category, TO_CHAR(date, 'YYYY-MM-DD') AS date 
       FROM expenses WHERE id = $1`, [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/expenses
app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ error: 'Valid date is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, amount::float, category, TO_CHAR(date, 'YYYY-MM-DD') AS date`,
      [title.trim(), numericAmount, category, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount > 20) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ error: 'Valid date is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, amount::float, category, TO_CHAR(date, 'YYYY-MM-DD') AS date`,
      [title.trim(), numericAmount, category, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 4. PUT /api/expenses/:id
app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  const { title, amount, category, date } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ error: 'Valid date is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE expenses 
       SET title = $1, amount = $2, category = $3, date = $4 
       WHERE id = $5 
       RETURNING id, title, amount::float, category, TO_CHAR(date, 'YYYY-MM-DD') AS date`,
      [title.trim(), numericAmount, category, date, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE /api/expenses/:id
app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.status(200).json({ message: 'Expense deleted successfully', id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});