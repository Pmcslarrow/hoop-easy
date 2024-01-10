USE hoop_easy_db;
/*
ALTER TABLE games DROP FOREIGN KEY games_ibfk_1;
ALTER TABLE confirmedGames DROP FOREIGN KEY confirmedgames_ibfk_1;
ALTER TABLE confirmedGames DROP FOREIGN KEY confirmedgames_ibfk_2;
ALTER TABLE pendingGames DROP FOREIGN KEY pendinggames_ibfk_1;
ALTER TABLE pendingGames DROP FOREIGN KEY pendinggames_ibfk_2;
ALTER TABLE teammates DROP FOREIGN KEY teammates_ibfk_1;
ALTER TABLE teammates DROP FOREIGN KEY teammates_ibfk_2;
ALTER TABLE profilePictures DROP FOREIGN KEY profilepictures_ibfk_1;
*/

DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    firstName VARCHAR(255),
    middleInitial VARCHAR(1) NULL,
    lastName VARCHAR(255),
    gamesAccepted INT,
    gamesDenied INT,
    gamesPlayed INT, 
    heightFt INT NULL,
    heightInches INT NULL,
    weight INT NULL,
    overall VARCHAR(255) NULL,
    profilePic VARCHAR(255) NULL
);

DROP TABLE IF EXISTS games;
CREATE TABLE IF NOT EXISTS games (
    gameID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    address VARCHAR(255),
    longitude VARCHAR(255),
    latitude VARCHAR(255),
    dateOfGameInUTC DATETIME,
    distance VARCHAR(255) NULL,
    gameType SMALLINT,
    playerCreatedID VARCHAR(255),
    timeOfGame VARCHAR(255),
    userTimeZone VARCHAR(255),
    status VARCHAR(255),
    teammates JSON,
    captains JSON NULL,
    scores JSON NULL,
    team1 JSON NULL,
    team2 JSON NULL,
    teamOneApproval TINYINT(1),
    teamTwoApproval TINYINT(1),
    FOREIGN KEY (userID) REFERENCES users(id)
);


DROP TABLE IF EXISTS game_history;
CREATE TABLE game_history (
    userID INT NOT NULL, 
    rating VARCHAR(255) NOT NULL,
    my_team_score INT NOT NULL,
    opponent_team_score INT NOT NULL,
    game_date DATETIME NOT NULL,
    game_location VARCHAR(255) NOT NULL,
    opponent_ids JSON NOT NULL, 
    FOREIGN KEY (userID) REFERENCES users(id)  
);

DROP TABLE IF EXISTS confirmedGames;
DROP TABLE IF EXISTS pendingGames;
DROP TABLE IF EXISTS teammates;
DROP TABLE IF EXISTS profilePictures