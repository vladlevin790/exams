const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

const maxInactiveTime = 15 * 1000; 

app.use((req, res, next) => {
    if (req.session.lastActivity && Date.now() - req.session.lastActivity > maxInactiveTime) {
        req.session.destroy(err => {
            if (err) return next(err);
            res.redirect('/login'); 
        });
    } else {
        req.session.lastActivity = Date.now();
        next();
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/dashboard', (req, res) => {
    res.send("<h1>Добро пожаловать в панель управления!</h1><p>Ваша сессия активна.</p>");
});

app.get('/login', (req, res) => {
    res.send("<h1>Вы вышли из системы. Пожалуйста, войдите.</h1>");
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send("Ошибка при выходе");
        res.redirect('/login');
    });
});

app.listen(3000, () => {
    console.log("Сервер запущен на порту 3000");
});
