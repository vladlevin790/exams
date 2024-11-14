const express = require('express');
const axios = require('axios');
const geoip = require('geoip-lite');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

let userSession = {}; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let knownUserIPs = {};

function sendNotification(email, subject, message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

function checkSuspiciousLogin(user, ip) {
  const geo = geoip.lookup(ip);
  const region = geo ? geo.region : 'Unknown';

  if (userSession[user] && userSession[user].region !== region) {
    const message = `Suspicious login detected for user: ${user} from a different region (${region}).`;
    console.log(message);
    sendNotification(userSession[user].email, 'Suspicious Login Detected', message);
    return true;
  }

  if (!userSession[user]) {
    userSession[user] = { region, ip, email: user }; 
    return false;
  }

  return false;
}

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Login</h1>
        <form action="/login" method="POST">
          <input type="text" name="username" placeholder="Username" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (username === 'testUser' && password === 'password123') {
    const geo = geoip.lookup(userIP);
    const region = geo ? geo.region : 'Unknown';

    const suspicious = checkSuspiciousLogin(username, userIP);

    if (suspicious) {
      res.send('<h1>Suspicious activity detected. Notification has been sent.</h1>');
    } else {
      res.send('<h1>Login successful!</h1>');
    }
  } else {
    res.status(401).send('<h1>Invalid credentials</h1>');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//testUser and password password123
