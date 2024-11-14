const express = require('express');
const speakeasy = require('speakeasy');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const users = [];

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Username too short'),
    body('password').isLength({ min: 8 }).withMessage('Password too short')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const secret = speakeasy.generateSecret({ length: 20 });
    users.push({ username, password, secret: secret.base32 });

    const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
    });

    res.status(201).json({
        message: 'User registered',
        otp: token 
    });
});

app.post('/login', [
    body('username').isLength({ min: 3 }).withMessage('Username too short'),
    body('password').isLength({ min: 8 }).withMessage('Password too short')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = speakeasy.totp({
        secret: user.secret,
        encoding: 'base32'
    });

    req.session.tempToken = token;

    res.status(200).json({ message: 'OTP sent', otp: token }); 
});

app.post('/verify', [
    body('otp').isLength({ min: 6 }).withMessage('Invalid OTP length')
], (req, res) => {
    const { otp } = req.body;

    if (req.session.tempToken !== otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
    }

    req.session.user = { username: 'user' };
    res.status(200).json({ message: 'Login successful' });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
