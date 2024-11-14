import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,              
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 1000,
    },
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/start-session', (req, res) => {
  req.session.user = 'user123';  
  req.session.lastAction = Date.now(); 
  res.send('Сессия начата');
});

app.get('/check-session', (req, res) => {
  if (req.session.user) {
    const timeSinceLastAction = Date.now() - req.session.lastAction;

    if (timeSinceLastAction > 29 * 1000) { 
      req.session.destroy(); 
      res.send('Сессия завершена из-за бездействия.');
    } else {
      res.send('Сессия активна');
    }
  } else {
    res.send('Сессия не существует.');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
