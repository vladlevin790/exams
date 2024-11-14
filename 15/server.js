const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { hasPermission } = require('./roles');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));

const users = {
    admin: { password: 'admin123', role: 'admin' },
    user: { password: 'user123', role: 'user' }
};

function checkAuth(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

function authorize(permission) {
    return (req, res, next) => {
        const userRole = req.session.user.role;
        if (hasPermission(userRole, permission)) {
            return next();
        }
        res.status(403).send('Access Denied');
    };
}

app.get('/', checkAuth, (req, res) => {
    res.render('index', { role: req.session.user.role });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (user && user.password === password) {
        req.session.user = { username, role: user.role };
        return res.redirect('/');
    }
    res.redirect('/login');
});

app.get('/admin', checkAuth, authorize('view_admin_page'), (req, res) => {
    res.render('admin');
});

app.get('/user', checkAuth, authorize('view_user_page'), (req, res) => {
    res.render('user');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

//Log in as admin with the password admin123 to access the admin-only page. Log in as user with the password user123 to access only the user page.