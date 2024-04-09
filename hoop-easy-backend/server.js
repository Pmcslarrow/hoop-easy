// Imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
//const mysql = require('mysql');
const mysql = require('mysql2');

// Initialize Express App
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// GLOBALS
function createData(col1, col2, col3, col4, id) {
  return {  col1, col2, col3, col4, id };
}

function convertToLocalTime( storedUtcDateTime ) {
    const userLocalDateTime = new Date(storedUtcDateTime);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userDateTimeString = userLocalDateTime.toLocaleString('en-US', { timeZone: userTimeZone });
    return userDateTimeString
}

function extractDateTime(datetime) {
    const split = datetime.split(',')
    return { date: split[0], time: split[1] }
}

async function sortGamesByLocationDistance (games) {
    const userCoordinates = await getUserCoordinates();
    const { latitude: userLat, longitude: userLon } = userCoordinates;
    const sortedGames = games.sort((game1, game2) => {
        const distance1 = getDistanceFromLatLonInMiles(userLat, userLon, game1.latitude, game1.longitude);
        const distance2 = getDistanceFromLatLonInMiles(userLat, userLon, game2.latitude, game2.longitude);
        return distance1 - distance2;
    });
    
    sortedGames.forEach((game) => {
        game.distance = getDistanceFromLatLonInMiles(userLat, userLon, game.latitude, game.longitude);
        game.time = convertToLocalTime(game.dateOfGameInUTC);
    });
    
    return sortedGames;
};

export default function getUserCoordinates() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                   resolve({
                       latitude: position.coords.latitude,
                       longitude: position.coords.longitude
                   });
                },
                (error) => {
                   reject(error);
                }
            );
        } else {
            reject('Geolocation is not supported by this browser.');
        }
    });
 }

function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    var dInMiles = d * 0.621371; // Convert to miles
    return dInMiles;
 }
 
 function deg2rad(deg) {
    return deg * (Math.PI/180)
 }


const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    port: 23250,
    connectionLimit: 10,
});

// GET Routes
app.get('/api/users', (req, res) => {
    pool.query('SELECT * FROM users;', (err, result, fields) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.send(result);
    });
});

app.get('/api/games', (req, res) => {
    pool.query('SELECT * FROM games;', (err, result, fields) => {
        if (err) {
            console.log(err)
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.send(result);
    });
});

app.get('/api/getRankings', (req, res) => {
    pool.query('SELECT * FROM users;', (err, result, fields) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
	const rankData = result.data.map((obj, i) => {
		return createData(obj.username, i + 1, obj.overall, obj.gamesPlayed, obj.id)
	}).sort((a, b) =>  parseFloat(b.overall) - parseFloat(a.overall));
        res.send(rankData)
    });
});



app.get('/api/getUser', async (req, res) => {
    try {
        const userEmail = req.query.email;
        if (!userEmail) {
            return res.status(400).json({ message: 'Email parameter is required' });
        }
        const sql = 'SELECT * FROM users WHERE email = ?';
        pool.query(sql, [userEmail], (err, result) => {
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
        pool.query(sql, [userID], (err, result) => {
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
    pool.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error getting profiles")
            return
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
    WHERE JSON_SEARCH(g.teammates, 'one', '${userID}') IS NOT NULL;
    `

    pool.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error getting myGames")
            return
        }
        const myGames = result.data.map((obj, i) => {
		const convertedDateTime = convertToLocalTime(obj?.dateOfGameInUTC)
		const { date, time } = extractDateTime(convertedDateTime)
		return createData(obj.gameType, obj.address, date, time, obj.gameID)
	})
	res.status(200).send(myGames)
    })
})

app.get('/api/availableGames', async (req, res) => {
    const sql = `SELECT * FROM games WHERE status = 'pending';`
    pool.query(sql, (err, result, fields) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ message: 'Failed to get available games' });
        }
	const sortedGames = await sortGamesByLocationDistance(result.data);
        res.send(sortedGames)
        return sortedGames
    })
})

app.get('/api/getTeammates', async (req, res) => {
    try {
        const game = req.query; 
        const gameID = game.gameID
        const sql = `SELECT teammates FROM games WHERE gameID = ${gameID}`
        pool.query(sql, (err, result, fields) => {
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
        pool.query(sql, [currentUserEmail], (err, result) => {
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

app.get('/api/teamData', async(req, res) => {
    const team = req.query.values;
    const query = `SELECT * FROM users WHERE id IN (?)`;
    pool.query(query, [team], (err, result) => {
        if (err) {
            res.status(500).send("Failed to get team data for verifying a game")
            return
        }
        res.status(200).send(result)
    })
})

app.get('/api/getHistory', (req, res) => {
    const userID = req.query.userID
    const sql = `SELECT * FROM game_history WHERE userID = ?;`
    if (userID) {
        pool.query(sql, [userID], (err, result) => {
            if (err) {
                res.status(500).send("Error getting player history. Please remember to insert userID parameter")
            }
            res.status(200).send(result)
        })
    }
})

app.get('/api/averageOverall', async (req, res) => {
    const arrayOfID = req.query.teammates

    const sql = `
    SELECT AVG(overall)
    FROM users
    WHERE id IN (?);
    `

    pool.query(sql, [arrayOfID], (err, result) => {
        if (err) {
            res.status(500).send("Failed to get the average")
            return
        }

        res.status(200).send(result)
    })
})


// POST Route
app.post('/api/newUser', (req, res) => {
    try {
        console.log("Creating new user...")
        const user = req.body;
        const { username, email, firstName, middleInitial, lastName, gamesAccepted, gamesDenied, gamesPlayed, heightFt, heightInches, weight, overall } = user;
        const sql = `INSERT INTO users (username, email, firstName, middleInitial, lastName, gamesAccepted, gamesDenied, gamesPlayed, heightFt, heightInches, weight, overall, profilePic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        pool.query(sql, [username, email, firstName, middleInitial, lastName, gamesAccepted, gamesDenied, gamesPlayed, heightFt || null, heightInches || null, weight , overall, 'nullstring'], (err, result) => {
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
            const sql = `INSERT INTO games (userID, address, longitude, latitude, dateOfGameInUTC, timeOfGame, gameType, playerCreatedID, userTimeZone, status, teammates) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const teammates = `{"teammate0" : "${userID}"}`
            pool.query(sql, [userID, address, longitude, latitude, dateOfGame, timeOfGame, gameType, playerCreatedID, userTimeZone, 'pending', teammates], (err, result) => {
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

app.post('/api/createHistoryInstance', async (req, res) => {
    const historyData = req.body.params.values;
    const team = historyData.team;
    const rating = historyData.rating;
    const my_team_score = historyData.what[0];
    const opponent_team_score = historyData.what[1];
    const game_date = historyData.when;
    const game_location = historyData.where;
    const opponent_ids = JSON.stringify(historyData.who); 
    
    const sql = `
        INSERT INTO game_history (
            userID,
            rating,
            my_team_score,
            opponent_team_score,
            game_date,
            game_location,
            opponent_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (let userID of team) {
        pool.query(sql, [userID, rating, my_team_score, opponent_team_score, game_date, game_location, opponent_ids], (err, result) => {
            if (err) {
                return res.status(500).send("Failed adding history data");
            }            
            res.status(200).send("Success adding history data");
        });
    }
});


// PUT 
app.put('/api/updateTeammates', (req, res) => {
    const gameID = req.query.gameID
    const JSON = req.query.teammateJson
    const sql = `UPDATE games SET teammates = '${JSON}' WHERE gameID = ${gameID}`
    pool.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error updating teammates (query)")
            return
        }
        res.status(200).send("Success updating teammates")
    })
})

app.put('/api/updateStatus', (req, res) => {
    const gameID = req.query.gameID
    const status = req.query.status
    const sql = `UPDATE games SET status = '${status}' WHERE gameID = ${gameID};`

    pool.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error updating status")
            return
        }
        res.status(200).send("Success updating status")
    })
})

// `http://localhost:5001/api/handleGameSubmission?team1=${teamOneObject}&team2=${teamTwoObject}&status=verification`
app.put('/api/handleGameSubmission', (req, res) => {
    const data = req.body;
    const status = data.params.status;
    const teamOne = data.params.teamOne;
    const teamTwo = data.params.teamTwo;
    const captainJSON = data.params.captainJSON;
    const scoreJSON = data.params.scoreJSON;
    const gameID = data.params.gameID;

    const sql = `
        UPDATE games
        SET 
            status = ?,
            captains = ?,
            scores = ?,
            team1 = ?,
            team2 = ?
        WHERE gameID = ?
    `;

    pool.query(sql, [status, captainJSON, scoreJSON, teamOne, teamTwo, gameID], (err, result) => {
        if (err) {
            console.error("Error handling game submission:", err);
            res.status(500).send("Error handling game submission");
            return;
        }
        
        res.status(200).send("Success handling game submission");
    });
});

app.put('/api/approveScore', (req, res) => {
    const teamNumber = req.query.team
    const gameID = req.query.gameID
    const column = parseInt(teamNumber) === 1 ? 'teamOneApproval' : 'teamTwoApproval'
    const sql = `
    UPDATE games
    SET
        ${column} = TRUE
    WHERE gameID = ?
    `

    pool.query(sql, [gameID], (err, result) => {
        if (err) {
            res.status(500).send("Failed approving game score")
            return
        }
        res.status(200).send("Success approving game score")
    })
})

app.put('/api/updateTeamOverallRatings', (req, res) => {
    const ratingChange = parseFloat(req.query.overallChange).toFixed(2)
    const team = req.body.params.values

    const sql = `
    UPDATE users
    SET 
        overall = LEAST(GREATEST(CAST(overall AS DECIMAL(10, 2)) + ?, 60), 99),
        gamesPlayed = gamesPlayed + 1,
        gamesAccepted = gamesAccepted + 1
    WHERE id IN (?);
    `

    pool.query(sql, [ratingChange, team], (err, result) => {
        if (err) {
            res.status(500).send("Failed to update team overall ratings")
            return
        }

        res.status(200).send("Success updating team overall ratings")
    })
})

app.put('/api/updateDeniedGames', (req, res) => {
    const players = req.body.params.values
    const sql = `
    UPDATE users
	SET gamesDenied = gamesDenied + 1
    WHERE id IN (?);
    `
    pool.query(sql, [players], (err, result) => {
        if (err) {
            return res.status(500).send("Failed to updateDeniedGames")
        }
        res.status(200).send("Success updating player denied games ratings")
    })
})

app.put('/api/updateProfileData', (req, res) => {
    const userID = req.body.params.userID;
    const fieldsToUpdate = req.body.params.values;
    const filteredFields = Object.entries(fieldsToUpdate).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
    }, {});

    const keys = Object.keys(filteredFields);
    const values = Object.values(filteredFields);
    
    let setClause = keys.map((key) => `${key} = ?`).join(', ');

    const sql = `
        UPDATE users
        SET ${setClause}
        WHERE id = ?`;  
    
    pool.query(sql, [...values, userID], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).send("Failed to update profile information");
        }
        
        res.status(200).send("Success updating profile information");
    });
});




// DELETE
app.delete('/api/deleteGame', (req, res) => {
    try {
        const gameID = req.query.gameID;
        if (!gameID || isNaN(gameID)) {
            return res.status(400).send("Invalid gameID provided");
        }

        const sql = 'DELETE FROM games WHERE gameID = ?';
        pool.query(sql, [gameID], (err, result) => {
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

/* 
EMAIL CONFIRMATION HANDLING

- The next step here below is to implement call backs to send an email to the two captains with the score of the games 
- Then they can click the link to accept or deny in the email which reconnects to the callback link defined here
*/



// Server Setup
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

