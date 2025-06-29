const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./orders.db');

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// Initialize database and create table
// Create orders table if not exists
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items TEXT NOT NULL,
        total INTEGER NOT NULL
    )`);
});

// Sample route
app.get('/', (req, res) => {
    res.send('Welcome to Food Delivery Site!');
});

// API to save order to database
app.post('/api/orders', (req, res) => {
    const { items, total } = req.body;
    if (!items || !total) {
        return res.status(400).json({ error: 'Invalid order data' });
    }
    const itemsString = JSON.stringify(items);
    db.run(
        `INSERT INTO orders (items, total) VALUES (?, ?)`,
        [itemsString, total],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save order' });
            }
            res.status(201).json({ message: 'Order received!', orderId: this.lastID });
        }
    );
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
});


// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
