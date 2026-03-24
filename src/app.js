const express = require('express');
const path = require('path');
const crypto = require('crypto');

let bcrypt;
try {
    bcrypt = require('bcrypt');
} catch (error) {
    console.warn('bcrypt not available, falling back to scrypt hashing:', error.message);
}

let sqlite3;
try {
    sqlite3 = require('sqlite3').verbose();
} catch (error) {
    console.warn('sqlite3 not available, using in-memory storage fallback:', error.message);
}

const app = express();
const isVercel = Boolean(process.env.VERCEL);
const databasePath = isVercel
    ? path.join('/tmp', 'orders.db')
    : path.join(__dirname, '..', 'orders.db');

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

const memoryStore = {
    users: [],
    orders: [],
    userId: 1,
    orderId: 1,
};

let db = null;
if (sqlite3) {
    try {
        db = new sqlite3.Database(databasePath);
    } catch (error) {
        console.error('Failed to initialize sqlite database, using memory store fallback:', error);
        db = null;
    }
}

function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function handleRun(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row || null);
        });
    });
}

function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows || []);
        });
    });
}

async function initSqlite() {
    if (!db) {
        return;
    }

    await runQuery(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);

    await runQuery(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items TEXT NOT NULL,
        total INTEGER NOT NULL,
        name TEXT,
        address TEXT,
        phone TEXT
    )`);

    const columns = await allQuery(`PRAGMA table_info(orders)`);
    const hasUserId = columns.some((column) => column.name === 'user_id');
    if (!hasUserId) {
        await runQuery(`ALTER TABLE orders ADD COLUMN user_id INTEGER`);
    }
}

const initPromise = initSqlite().catch((error) => {
    console.error('Sqlite initialization failed, switching to in-memory storage:', error);
    db = null;
});

async function hashPassword(password) {
    if (bcrypt) {
        return bcrypt.hash(password, 10);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return `scrypt$${salt}$${derived}`;
}

async function verifyPassword(password, storedHash) {
    if (!storedHash) {
        return false;
    }

    if (storedHash.startsWith('scrypt$')) {
        const parts = storedHash.split('$');
        if (parts.length !== 3) {
            return false;
        }
        const [, salt, hash] = parts;
        const derived = crypto.scryptSync(password, salt, 64).toString('hex');
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
    }

    if (!bcrypt) {
        return false;
    }

    return bcrypt.compare(password, storedHash);
}

async function createUser(username, passwordHash) {
    if (db) {
        const result = await runQuery(
            `INSERT INTO users (username, password) VALUES (?, ?)`,
            [username, passwordHash]
        );
        return { id: result.lastID, username, password: passwordHash };
    }

    const exists = memoryStore.users.some((user) => user.username === username);
    if (exists) {
        const duplicateError = new Error('UNIQUE constraint failed: users.username');
        duplicateError.code = 'SQLITE_CONSTRAINT';
        throw duplicateError;
    }

    const user = { id: memoryStore.userId++, username, password: passwordHash };
    memoryStore.users.push(user);
    return user;
}

async function findUserByUsername(username) {
    if (db) {
        return getQuery(`SELECT * FROM users WHERE username = ?`, [username]);
    }
    return memoryStore.users.find((user) => user.username === username) || null;
}

async function createOrder(items, total, name, address, phone, userId) {
    if (db) {
        const result = await runQuery(
            `INSERT INTO orders (items, total, name, address, phone, user_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [JSON.stringify(items), total, name, address, phone, userId]
        );
        return result.lastID;
    }

    const orderId = memoryStore.orderId++;
    memoryStore.orders.push({
        id: orderId,
        items,
        total,
        name,
        address,
        phone,
        user_id: Number(userId),
    });
    return orderId;
}

async function getAllOrders() {
    if (db) {
        const rows = await allQuery(`SELECT id, items, total, name, address, phone, user_id FROM orders`);
        return rows.map((row) => ({
            ...row,
            items: JSON.parse(row.items || '[]'),
        }));
    }

    return memoryStore.orders;
}

async function getOrdersByUserId(userId) {
    if (db) {
        const rows = await allQuery(`SELECT * FROM orders WHERE user_id = ?`, [userId]);
        return rows.map((row) => ({
            ...row,
            items: JSON.parse(row.items || '[]'),
        }));
    }

    return memoryStore.orders.filter((order) => Number(order.user_id) === Number(userId));
}

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        storage: db ? 'sqlite' : 'memory',
        hashing: bcrypt ? 'bcrypt' : 'scrypt',
    });
});

app.post('/api/orders', async (req, res) => {
    await initPromise;

    const { items, total, name, address, phone, userId } = req.body;
    if (!items || !total || !name || !address || !phone || !userId) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    try {
        const orderId = await createOrder(items, total, name, address, phone, userId);
        return res.status(201).json({ message: 'Order received!', orderId });
    } catch (error) {
        console.error('Create order failed:', error);
        return res.status(500).json({ error: 'Failed to save order' });
    }
});

app.get('/api/orders', async (req, res) => {
    await initPromise;

    try {
        const orders = await getAllOrders();
        return res.json(orders);
    } catch (error) {
        console.error('Fetch orders failed:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.get('/api/my-orders', async (req, res) => {
    await initPromise;

    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const orders = await getOrdersByUserId(userId);
        return res.json(orders);
    } catch (error) {
        console.error('Fetch user orders failed:', error);
        return res.status(500).json({ error: 'Failed to fetch user orders' });
    }
});

app.post('/signup', async (req, res) => {
    await initPromise;

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const passwordHash = await hashPassword(password);
        const user = await createUser(username, passwordHash);
        return res.status(201).json({ message: 'User created successfully!', userId: user.id });
    } catch (error) {
        if (String(error.message).includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        console.error('Signup failed:', error);
        return res.status(500).json({ message: 'Failed to create user' });
    }
});

app.post('/login', async (req, res) => {
    await initPromise;

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        return res.status(200).json({ message: 'Login successful!', username: user.username, userId: user.id });
    } catch (error) {
        console.error('Login failed:', error);
        return res.status(500).json({ message: 'Login failed' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = 3000;
if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;