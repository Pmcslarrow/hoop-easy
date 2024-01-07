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

app.get('/api/getUserWithID', async (req, res) => {
    try {
        const userID = req.query.userID;
        if (!userID) {
            return res.status(400).json({ message: 'UserID parameter is required' });
        }
        const sql = 'SELECT * FROM users WHERE id = ?';
        connection.query(sql, [userID], (err, result) => {
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

app.get('/api/getProfiles', async (req, res) => {
    const arrayOfID = req.query.arrayOfID;
    const array = arrayOfID.split(',')

    const sql = `SELECT * FROM users WHERE id IN (${array.join(', ')})`;
    console.log(sql)
    connection.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error getting profiles")
        }
        res.status(200).send(result)
    })

    console.log(arrayOfID)
});

app.get('/api/myGames', async (req, res) => {
    const userID = req.query.userID
    const sql = `
    SELECT *
    FROM games AS g
    WHERE 
    EXISTS (
        SELECT 1
        FROM JSON_TABLE(g.teammates, '$.*' COLUMNS(value VARCHAR(255) PATH '$')) AS teammate
        WHERE teammate.value = '${userID}'
    );
    `

    connection.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error getting myGames")
        }
        res.status(200).send(result)
    })
})

app.get('/api/availableGames', async (req, res) => {
    const sql = `SELECT * FROM games WHERE status = 'pending';`
    connection.query(sql, (err, result, fields) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ message: 'Failed to get available games' });
        }
        console.log(result)
        console.log(typeof(result))
        res.send(result)
        return result
    })
})

app.get('/api/getTeammates', async (req, res) => {
    try {
        const game = req.query; 
        const gameID = game.gameID
        const sql = `SELECT teammates FROM games WHERE gameID = ${gameID}`
        connection.query(sql, (err, result, fields) => {
            res.status(200).send(result)
        })
    } catch (err) {
        res.status(500).send("Error getting teammates")
    }

});

app.get('/api/getCurrentUserID', async(req, res) => {
    try {
        const currentUserEmail = req.query.email
        const sql = 'SELECT * FROM users WHERE email = ?';
        connection.query(sql, [currentUserEmail], (err, result) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ message: 'Failed to fetch user' });
            }
            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            console.log("Current user id = ", result[0].id)
            res.json(result[0].id);
        });
    } catch(err) {
        res.status(500).send("Error getting current user ID")
    }
})

// POST Route
app.post('/api/newUser', (req, res) => {
    try {
        const user = req.body;
        const { username, email, firstName, middleInitial, lastName, gamesAccepted, gamesDenied, gamesPlayed, heightFt, heightInches, weight, overall } = user;
        const sql = `INSERT INTO users (username, email, firstName, middleInitial, lastName, gamesAccepted, gamesDenied, gamesPlayed, heightFt, heightInches, weight, overall, profilePic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(sql, [username, email, firstName, middleInitial, lastName, gamesAccepted, gamesDenied, gamesPlayed, heightFt, heightInches, weight, overall, 'nullstring'], (err, result) => {
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

        console.log("Inserting dateOfGame as: ", dateOfGame)
        const addNewGameToGamesTable = async () => {
            const sql = `INSERT INTO games (userID, address, longitude, latitude, dateOfGameInUTC, timeOfGame, gameType, playerCreatedID, userTimeZone, status, teammates) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const teammates = `{"teammate0" : "${userID}"}`
            connection.query(sql, [userID, address, longitude, latitude, dateOfGame, timeOfGame, gameType, playerCreatedID, userTimeZone, 'pending', teammates], (err, result) => {
                if (err) {
                    console.error('Error inserting new game:', err);
                    return res.status(500).json({ message: 'Failed to create new game', error: err.message });
                }
                console.log('New game inserted successfully:', result);
            });
        }

        await addNewGameToGamesTable();
        res.send('All operations completed successfully');
    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// PUT 
app.put('/api/updateTeammates', (req, res) => {
    const gameID = req.query.gameID
    const JSON = req.query.teammateJson
    const sql = `UPDATE games SET teammates = '${JSON}' WHERE gameID = ${gameID}`
    connection.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error updating teammates (query)")
        }
        res.status(200).send("Success updating teammates")
    })
})

app.put('/api/updateStatus', (req, res) => {
    const gameID = req.query.gameID
    const status = req.query.status
    const sql = `UPDATE games SET status = '${status}' WHERE gameID = ${gameID};`

    connection.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error updating status")
        }
        res.status(200).send("Success updating status")
    })
})

// DELETE
app.delete('/api/deleteGame', (req, res) => {
    try {
        const gameID = req.query.gameID;
        if (!gameID || isNaN(gameID)) {
            return res.status(400).send("Invalid gameID provided");
        }

        const sql = 'DELETE FROM games WHERE gameID = ?';
        connection.query(sql, [gameID], (err, result) => {
            if (err) {
                console.error("Error deleting game:", err);
                return res.status(500).send("Error trying to delete game");
            }
            console.log("Success deleting game!!!");
            res.status(200).send("Success deleting game");
        });
    } catch (err) {
        console.error("Error in deleteGame endpoint:", err);
        res.status(500).send("Error trying to delete game.");
    }
});






// Server Setup
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
