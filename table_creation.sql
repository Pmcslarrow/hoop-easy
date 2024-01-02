USE hoop_easy_db;


ALTER TABLE games DROP FOREIGN KEY games_ibfk_1;
ALTER TABLE confirmedGames DROP FOREIGN KEY confirmedgames_ibfk_1;
ALTER TABLE confirmedGames DROP FOREIGN KEY confirmedgames_ibfk_2;
ALTER TABLE pendingGames DROP FOREIGN KEY pendinggames_ibfk_1;
ALTER TABLE pendingGames DROP FOREIGN KEY pendinggames_ibfk_2;
ALTER TABLE teammates DROP FOREIGN KEY teammates_ibfk_1;
ALTER TABLE teammates DROP FOREIGN KEY teammates_ibfk_2;
ALTER TABLE profilePictures DROP FOREIGN KEY profilepictures_ibfk_1;


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
    overall VARCHAR(255) NULL
);

DROP TABLE IF EXISTS games;
CREATE TABLE IF NOT EXISTS games (
    gameID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    address VARCHAR(255),
    longitude VARCHAR(255),
    latitude VARCHAR(255),
    dateOfGame DATETIME,
    distance VARCHAR(255) NULL,
    gameType SMALLINT,
    playerCreatedID VARCHAR(255),
    timeOfGame VARCHAR(255),
    userTimeZone VARCHAR(255),
    FOREIGN KEY (userID) REFERENCES users(id)
);

DROP TABLE IF EXISTS confirmedGames;
CREATE TABLE IF NOT EXISTS confirmedGames (
    confirmedGameID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    gameID INT,
    address VARCHAR(255),
    longitude VARCHAR(255),
    latitude VARCHAR(255),
    dateOfGame DATETIME,
    distance VARCHAR(255) NULL,
    gameType SMALLINT,
    playerCreatedID VARCHAR(255),
    timeOfGame VARCHAR(255),
    userTimeZone VARCHAR(255),
    FOREIGN KEY (userID) REFERENCES users(id),
    FOREIGN KEY (gameID) REFERENCES games(gameID)
);

DROP TABLE IF EXISTS pendingGames;
CREATE TABLE IF NOT EXISTS pendingGames (
    pendingGameID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    gameID INT,
    address VARCHAR(255),
    longitude VARCHAR(255),
    latitude VARCHAR(255),
    dateOfGame DATETIME,
    distance VARCHAR(255) NULL,
    gameType SMALLINT,
    playerCreatedID VARCHAR(255),
    timeOfGame VARCHAR(255),
    userTimeZone VARCHAR(255),
    FOREIGN KEY (userID) REFERENCES users(id),
    FOREIGN KEY (gameID) REFERENCES games(gameID)
);

DROP TABLE IF EXISTS teammates;
CREATE TABLE IF NOT EXISTS teammates (
    teammateID       INT AUTO_INCREMENT PRIMARY KEY,
    gameID           INT,
    userID           INT,
    FOREIGN KEY (gameID) REFERENCES games(gameID),
    FOREIGN KEY (userID) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS profilePictures (
	profilePicID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
	profilePictureURL VARCHAR(255),
	FOREIGN KEY (userID) REFERENCES users(id)
);




/*
This will select all games data for every user that exists (joins with games and teammates data)


SELECT 
    u.username,
    u.email,
    u.firstName,
    u.middleInitial,
    u.lastName,
    u.heightFt,
    u.heightInches,
    u.weight,
    u.overall,
    g.address,
    g.longitude,
    g.latitude,
    g.dateOfGame,
    g.distance,
    g.gameType,
    g.timeOfGame,
    g.userTimeZone,
    t.gameID,
    t.userID
FROM users AS u
JOIN games AS g ON u.id = g.userID
JOIN teammates AS t ON g.gameID = t.gameID;
*/