const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
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

const validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 20;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasDigits = /\d/;
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength || password.length > maxLength) {
        return `Password should be between ${minLength} and ${maxLength} characters long.`;
    }
    if (!hasUpperCase.test(password)) {
        return 'Password should contain at least one uppercase letter.';
    }
    if (!hasLowerCase.test(password)) {
        return 'Password should contain at least one lowercase letter.';
    }
    if (!hasDigits.test(password)) {
        return 'Password should contain at least one digit.';
    }
    if (!hasSpecialChars.test(password)) {
        return 'Password should contain at least one special character.';
    }
    return null;
};

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),
    body('password').custom((value) => {
        const validationError = validatePassword(value);
        if (validationError) {
            throw new Error(validationError);
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({ username, password: hashedPassword });

    res.status(201).json({ message: 'User registered' });
});

app.post('/login', [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = users.find((user) => user.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.session.user = user;

    res.status(200).json({ message: 'Login successful' });
});

app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'You must be logged in' });
    }
    res.json({ message: 'Welcome to your profile', user: req.session.user });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
