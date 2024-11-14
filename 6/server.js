const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();

const db = new sqlite3.Database('./database.db');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Error hashing password');
        }

        db.run(
            `INSERT INTO users (username, password) VALUES (?, ?)`,
            [username, hashedPassword],
            function (err) {
                if (err) {
                    return res.status(500).send('Error creating user');
                }
                res.send('User registered successfully');
            }
        );
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        (err, row) => {
            if (err) {
                return res.status(500).send('Error fetching user');
            }

            if (!row) {
                return res.status(404).send('User not found');
            }

            bcrypt.compare(password, row.password, (err, result) => {
                if (err) {
                    return res.status(500).send('Error comparing passwords');
                }

                if (result) {
                    res.send('Login successful');
                } else {
                    res.status(401).send('Invalid password');
                }
            });
        }
    );
});
