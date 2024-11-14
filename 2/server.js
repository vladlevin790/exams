const express = require('express');
const crypto = require('crypto');
const session = require('express-session');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));

function generateCSRFToken() {
  return crypto.randomBytes(64).toString('hex');
}

app.get('/form', (req, res) => {
  const csrfToken = generateCSRFToken();
  req.session.csrfToken = csrfToken;
  res.render('form', { csrfToken: csrfToken });
});

app.post('/submit', (req, res) => {
  const csrfTokenFromForm = req.body.csrfToken;
  if (csrfTokenFromForm !== req.session.csrfToken) {
    return res.status(403).send('CSRF token mismatch!');
  }
  res.send('Form submitted successfully!');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
