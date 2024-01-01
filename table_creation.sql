USE hoop_easy_db;

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

CREATE TABLE IF NOT EXISTS confirmedGames (
	confirmedGameID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    address VARCHAR(255),
    coordinates VARCHAR(255),
    dateOfGame DATETIME,
    distance VARCHAR(255) NULL,
    gameType SMALLINT,
    playerCreatedID VARCHAR(255),
    teammates JSON NULL,
    timeOfGame VARCHAR(255),
    userTimeZone VARCHAR(255),
	FOREIGN KEY (userID) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS pendingGames (
	pendingGameID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    address VARCHAR(255),
    coordinates VARCHAR(255),
    dateOfGame DATETIME,
    distance VARCHAR(255) NULL,
    gameType SMALLINT,
    playerCreatedID VARCHAR(255),
    teammates JSON NULL,
    timeOfGame VARCHAR(255),
    userTimeZone VARCHAR(255),
	FOREIGN KEY (userID) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS games (
	gameID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    address VARCHAR(255),
    coordinates VARCHAR(255),
    dateOfGame DATETIME,
    distance VARCHAR(255) NULL,
    gameType SMALLINT,
    playerCreatedID VARCHAR(255),
    teammates JSON NULL,
    timeOfGame VARCHAR(255),
    userTimeZone VARCHAR(255),
	FOREIGN KEY (userID) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS profilePictures (
	profilePicID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
	profilePictureURL VARCHAR(255),
	FOREIGN KEY (userID) REFERENCES users(id)
);