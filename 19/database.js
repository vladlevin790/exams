const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./auth_logs.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS auth_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      action TEXT NOT NULL,
      region TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function logEvent(username, ipAddress, action, region) {
  const stmt = db.prepare('INSERT INTO auth_logs (username, ip_address, action, region) VALUES (?, ?, ?, ?)');
  stmt.run(username, ipAddress, action, region);
  stmt.finalize();
}

function getLogs(callback) {
  db.all('SELECT * FROM auth_logs ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching logs', err);
    } else {
      callback(rows);
    }
  });
}

module.exports = { logEvent, getLogs };
