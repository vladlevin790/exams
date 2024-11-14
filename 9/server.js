const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

app.use(cookieParser());

app.get('/set-cookie', (req, res) => {
    res.cookie('sessionId', '1234567890', {
        httpOnly: true,  
        secure: process.env.NODE_ENV === 'production',  
        sameSite: 'Strict',  
        maxAge: 60 * 60 * 1000  
    });

    res.send('Cookie has been set with secure settings!');
});


app.get('/get-cookie', (req, res) => {
    const sessionId = req.cookies.sessionId; 
    if (sessionId) {
        res.send(`Session ID: ${sessionId}`);
    } else {
        res.send('No session cookie found.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
