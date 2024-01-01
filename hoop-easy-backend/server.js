// Imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql2');

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connecting to Database
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Loly2012!',
    database: 'hoop_easy_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database with id ' + connection.threadId);
});

/*
SELF NOTE ON USE:

connection.query( string, (err, res, fields) => { code })
connection.query(
    'SELECT * FROM TEST_TABLE;', (err, results, fields) => {
        console.log(results)
    }
)
*/




// Routes 
app.get('/api/games', async (req, res) => {
    try {
        res.send("Hello paul this worked for /api/games")
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
});
  





const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("test")
});


