const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./orders.db');

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// Initialize database and create table with new columns
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items TEXT NOT NULL,
        total INTEGER NOT NULL,
        name TEXT,
        address TEXT,
        phone TEXT
    )`);
});

// API to save order to database
app.post('/api/orders', (req, res) => {
    const { items, total, name, address, phone } = req.body;
    if (!items || !total || !name || !address || !phone) {
        return res.status(400).json({ error: 'Invalid order data' });
    }
    const itemsString = JSON.stringify(items);
    db.run(
        `INSERT INTO orders (items, total, name, address, phone) VALUES (?, ?, ?, ?, ?)`,
        [itemsString, total, name, address, phone],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save order' });
            }
            res.status(201).json({ message: 'Order received!', orderId: this.lastID });
        }
    );
});

// Corrected GET API to fetch all orders from database
app.get('/api/orders', (req, res) => {
    db.all(`SELECT id, items, total, name, address, phone FROM orders`, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
        // Parse items from JSON string to an array
        const orders = rows.map(row => ({
            ...row,
            items: JSON.parse(row.items)
        }));
        res.json(orders);
    });
});

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
