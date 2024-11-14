const express = require('express');
const session = require('express-session');

const app = express();
const port = 3000;

const users = {};
const MAX_ATTEMPTS = 3;
const LOCK_TIME = 5 * 60 * 1000;  

const loginAttempts = {};

app.use(session({
    secret: 'your-secret-key',  
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));

app.get('/register', (req, res) => {
    res.send(`
        <html>
        <head><title>Register</title></head>
        <body>
            <h1>Register</h1>
            <form action="/register" method="POST">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required><br><br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required><br><br>
                <button type="submit">Register</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (users[username]) {
        return res.send('User already exists. <a href="/">Go to login page</a>');
    }

    users[username] = { password };
    res.send('Registration successful. <a href="/">Go to login page</a>');
});

app.get('/', (req, res) => {
    let attemptsInfo = '';
    let lockInfo = '';

    if (req.session.username) {
        const userAttempts = loginAttempts[req.session.username] || { attempts: 0, lockUntil: null };

        if (userAttempts.lockUntil && userAttempts.lockUntil > Date.now()) {
            const timeLeft = Math.ceil((userAttempts.lockUntil - Date.now()) / 1000);
            lockInfo = `<p>Your account is locked. Try again in <span id="lock-timer">${timeLeft}</span> seconds.</p>`;
        } else {
            const remainingAttempts = MAX_ATTEMPTS - userAttempts.attempts;
            if (remainingAttempts > 0) {
                attemptsInfo = `<p>You have ${remainingAttempts} attempt(s) left.</p>`;
            } else {
                attemptsInfo = `<p>Your account is locked. Try again in a few minutes.</p>`;
            }
        }
    }
    
    res.send(`
        <html>
        <head><title>Login</title></head>
        <body>
            <h1>Login</h1>
            ${attemptsInfo}
            ${lockInfo}
            <form action="/login" method="POST">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required><br><br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required><br><br>
                <button type="submit">Login</button>
            </form>
            ${req.session.errorMessage ? `<p style="color: red;">${req.session.errorMessage}</p>` : ''}
            
            <script>
                // Обновляем таймер блокировки на клиенте
                function updateLockTimer() {
                    const lockTimer = document.getElementById('lock-timer');
                    if (lockTimer) {
                        let timeLeft = parseInt(lockTimer.textContent);
                        if (timeLeft > 0) {
                            lockTimer.textContent = timeLeft - 1;
                        }
                    }
                }

                // Если блокировка есть, начинаем отсчет
                if (document.getElementById('lock-timer')) {
                    setInterval(updateLockTimer, 1000);
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];

    if (!user) {
        req.session.errorMessage = 'Invalid username or password';
        return res.redirect('/');
    }

    const userAttempts = loginAttempts[username] || { attempts: 0, lockUntil: null };

    if (userAttempts.lockUntil && userAttempts.lockUntil > Date.now()) {
        const timeLeft = Math.ceil((userAttempts.lockUntil - Date.now()) / 1000);
        req.session.errorMessage = `Account is locked. Try again in ${timeLeft} seconds.`;
        return res.redirect('/');
    }

    if (user.password !== password) {
        userAttempts.attempts = (userAttempts.attempts || 0) + 1;

        if (userAttempts.attempts >= MAX_ATTEMPTS) {
            userAttempts.lockUntil = Date.now() + LOCK_TIME;
            req.session.errorMessage = 'Too many failed attempts. Account locked.';
        } else {
            req.session.errorMessage = 'Invalid username or password';
        }

        loginAttempts[username] = userAttempts;
        return res.redirect('/');
    }

    req.session.username = username;  
    loginAttempts[username] = { attempts: 0, lockUntil: null };  

    res.send(`<h1>Welcome, ${username}!</h1><p>You have logged in successfully.</p>`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
