// Imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

// Initialize Express App
const app = express();

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

// GET Routes
app.get('/api/users', (req, res) => {
    connection.query('SELECT * FROM users;', (err, result, fields) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.send(result);
    });
});

app.get('/api/games', (req, res) => {
    connection.query('SELECT * FROM games;', (err, result, fields) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.send(result);
    });
});

app.get('/api/getUser', async (req, res) => {
    try {
        const userEmail = req.query.email;
        if (!userEmail) {
            return res.status(400).json({ message: 'Email parameter is required' });
        }

        const sql = 'SELECT * FROM users WHERE email = ?';
        connection.query(sql, [userEmail], (err, result) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ message: 'Failed to fetch user' });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(result[0]);
        });

    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST Route
app.post('/api/newUser', (req, res) => {
    try {
        const user = req.body;
        const { username, email, firstName, middleInitial, lastName, gamesAccepted, gamesDenied, gamesPlayed, heightFt, heightInches, weight, overall } = user;
        const sql = `INSERT INTO users (username, email, firstName, middleInitial, lastName, gamesAccepted, gamesDenied, gamesPlayed, heightFt, heightInches, weight, overall) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(sql, [username, email, firstName, middleInitial, lastName, gamesAccepted, gamesDenied, gamesPlayed, heightFt, heightInches, weight, overall], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                res.status(500).json({ message: 'Failed to create user' });
                return;
            }
            console.log('User inserted successfully:', result);
            res.send('User created successfully');
        });

    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/api/newGame', async (req, res) => {
    try {
        const game = req.body;
        const { userID, address, latitude, longitude, dateOfGame, timeOfGame, gameType, playerCreatedID, userTimeZone } = game;

        const addNewGameToGamesTable = async () => {
            const sql = `INSERT INTO games (userID, address, longitude, latitude, dateOfGame, timeOfGame, gameType, playerCreatedID, userTimeZone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            connection.query(sql, [userID, address, longitude, latitude, dateOfGame, timeOfGame, gameType, playerCreatedID, userTimeZone], (err, result) => {
                if (err) {
                    console.error('Error inserting new game:', err);
                    return res.status(500).json({ message: 'Failed to create new game', error: err.message });
                }
                console.log('New game inserted successfully:', result);
            });
        }

        const addNewGameToTeammatesAndPendingGames = async () => {
            const getGameID = async () => {
                const sql = `SELECT * FROM games WHERE address = '${address}' AND userID = ${userID} AND dateOfGame = '${dateOfGame}' AND timeOfGame = '${timeOfGame}'`;
                return new Promise((resolve, reject) => {
                    connection.query(sql, (err, res, fields) => {
                        if (err) {
                            console.error('Error fetching game ID:', err);
                            reject(err);
                        } else {
                            resolve(res[0].gameID);
                        }
                    });
                });
            }
            const gameID = await getGameID();

            const sqlInsert = `INSERT INTO teammates (gameID, userID) VALUES (?, ?)`;
            connection.query(sqlInsert, [gameID, userID], (err, result) => {
                if (err) {
                    console.error('Error inserting new teammate:', err);
                    return res.status(500).json({ message: 'Failed to insert new teammate', error: err.message });
                }
                console.log('New teammate inserted successfully:', result);
            });


            const sqlInsertToPendingGames = `INSERT INTO pendingGames (userID, gameID, address, longitude, latitude, dateOfGame, timeOfGame, gameType, playerCreatedID, userTimeZone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            connection.query(sqlInsertToPendingGames, [userID, gameID, address, longitude, latitude, dateOfGame, timeOfGame, gameType, playerCreatedID, userTimeZone], (err, result) => {
                if (err) {
                    console.error('Error inserting into pendingGames:', err);
                    return res.status(500).json({ message: 'Failed to insert into pendingGames', error: err.message });
                }
                console.log('New game added to pendingGames:', result);
            });
        }

        await addNewGameToGamesTable();
        await addNewGameToTeammatesAndPendingGames()

        res.send('All operations completed successfully');

    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});









// Server Setup
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
