const express = require('express');
const helmet = require('helmet');
const escapeHtml = require('html-escaper').escape;

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"], 
    scriptSrc: ["'self'"],   
    styleSrc: ["'self'", "'unsafe-inline'"], 
    objectSrc: ["'none'"],   
    upgradeInsecureRequests: [] 
  }
}));


app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>XSS Protection Test</title></head>
        <body>
            <h1>Test XSS Protection</h1>
            <form action="/submit" method="POST">
                <label for="userInput">Enter your input:</label>
                <input type="text" id="userInput" name="userInput" required>
                <button type="submit">Submit</button>
            </form>
            <p>Try injecting malicious code like <code><script>alert('XSS')</script></code>.</p>
        </body>
        </html>
    `);
});

app.post('/submit', (req, res) => {
    const userInput = req.body.userInput;
    const safeInput = escapeHtml(userInput); 

    res.send(`
        <h1>Safe Output</h1>
        <p>Your input: ${safeInput}</p>
    `);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
