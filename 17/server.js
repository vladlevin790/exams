import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { URL } from 'url';

// google.com and http://127.0.0.1

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const blockedIPs = ['127.0.0.1', '10.0.0.1', '192.168.1.1'];

function isBlocked(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (blockedIPs.includes(hostname)) {
      return true;
    }

    const privateIPRegex = /^(10|127|172\.(1[6-9]|2[0-9]|3[0-1])|192\.168)\./;
    return privateIPRegex.test(hostname);

  } catch (error) {
    return true;
  }
}

app.post('/fetch', async (req, res) => {
  const { url } = req.body;
  
  if (isBlocked(url)) {
    return res.status(403).send('Access to this URL is blocked');
  }
  
  try {
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching the URL');
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
