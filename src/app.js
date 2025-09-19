const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const db = new sqlite3.Database('./orders.db');

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// Initialize database and create tables
db.serialize(() => {
    // Drop the orders table to add the new user_id column
    db.run(`DROP TABLE IF EXISTS orders`);
    db.run(`CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items TEXT NOT NULL,
        total INTEGER NOT NULL,
        name TEXT,
        address TEXT,
        phone TEXT,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Create a new table for users
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);
});

// API to save order to database
app.post('/api/orders', (req, res) => {
    const { items, total, name, address, phone, userId } = req.body;
    if (!items || !total || !name || !address || !phone || !userId) {
        return res.status(400).json({ error: 'Invalid order data' });
    }
    const itemsString = JSON.stringify(items);
    db.run(
        `INSERT INTO orders (items, total, name, address, phone, user_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [itemsString, total, name, address, phone, userId],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save order' });
            }
            res.status(201).json({ message: 'Order received!', orderId: this.lastID });
        }
    );
});

// Corrected GET API to fetch all orders from database for admin
app.get('/api/orders', (req, res) => {
    db.all(`SELECT id, items, total, name, address, phone, user_id FROM orders`, (err, rows) => {
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

// New API to fetch orders for a specific user
app.get('/api/my-orders', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    db.all(`SELECT * FROM orders WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch user orders' });
        }
        const orders = rows.map(row => ({
            ...row,
            items: JSON.parse(row.items)
        }));
        res.json(orders);
    });
});

// New API for user signup
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to create user' });
        }

        db.run(
            `INSERT INTO users (username, password) VALUES (?, ?)`,
            [username, hash],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ message: 'Username already exists' });
                    }
                    console.error(err);
                    return res.status(500).json({ message: 'Failed to create user' });
                }
                res.status(201).json({ message: 'User created successfully!', userId: this.lastID });
            }
        );
    });
});

// New API for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Login failed' });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.status(200).json({ message: 'Login successful!', username: user.username, userId: user.id });
        } else {
            res.status(400).json({ message: 'Invalid username or password' });
        }
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
