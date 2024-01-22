import React, { useState, useEffect } from 'react';
import { collection, GeoPoint, addDoc, getDocs } from 'firebase/firestore';
import axios from 'axios';

const CreateGameForm = ( props ) => {
    const { auth, db, gamesCollectionRef, usersCollectionRef, refreshToken, setRefreshToken, setCreateGameActive, isCreateGameActive } = props;

    function toggleCreateGame() {
        setCreateGameActive(!isCreateGameActive)
    }

    const [isVisible, setIsVisible] = useState(false);
        const [formData, setFormData] = useState({
            streetAddress: '',
            city: '',
            state: '',
            zipcode: '',
            dateOfGame: '',
            timeOfGame: '',
            gameType: '1' // 1v1, 2v2, 3v3, 4v4, 5v5
          });      

        useEffect(() => {
          setIsVisible(true);
        }, []);

        const handleFormChange = (event) => {
            const { id, value } = event.target;
            setFormData((prevData) => ({
              ...prevData,
              [id]: value,
            }));
        };

        const handleNewGameSubmission = async (event) => {
            event.preventDefault();  
            let userLoggedIn = auth?.currentUser;

            if (userLoggedIn) {
                const loggedInUser = await axios.get(`http://localhost:5001/api/getUser?email=${userLoggedIn?.email}`);
                fetchLocationCoordinates()
                    .then(({ longitude, latitude }) => {
                        createNewGameInstance( longitude, latitude, loggedInUser )
                        toggleCreateGame()
                })
                    .catch((error) => {
                        console.error(error.message);
                });

            } else {
                console.log("No user signed in");
            }
        };    

        const fetchLocationCoordinates = () => {
            const params = {
                street: formData.streetAddress,
                city: formData.city,
                state: formData.state,
                postalcode: formData.zipcode,
                country: 'US',
                api_key: '658aebd0c64fa653030796mdh9457e3'
            };
            const API_START = 'https://geocode.maps.co/search'
         
            console.log(params)
         
            return axios.get(API_START, { params: params })
                .then((response) => {
                    const data = response.data;
         
                    if (data.length > 0) {
                        const coordinates = {
                           longitude: data[0].lon,
                           latitude: data[0].lat
                        };
                        return coordinates;
                    } else {
                        throw new Error('Could not find this address');
                    }
                })
                .catch((error) => {
                    console.error(error);
                    throw error; 
                });
         }

         function formatToLocalDatetimeString(localDateTimeString) {
            const dateObj = new Date(localDateTimeString);
        
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
                
         const createNewGameInstance = async (longitude, latitude, loggedInUser) => {
            const addressString = formData.streetAddress;
            const date = formData.dateOfGame;
            const time = formData.timeOfGame;
            const gameType = formData.gameType;
            const playerID = loggedInUser.data.id;
            const userDateTime = new Date(`${date}T${time}`);
            const dateOfGame = formatToLocalDatetimeString(userDateTime)
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const teammates = { playerID };

            if (userDateTime < new Date()) {
                console.log("Cannot add game in the past");
                return;
            }
            
            const data = {
                userID: playerID,
                address: addressString,
                longitude,
                latitude,
                dateOfGame: dateOfGame,
                timeOfGame: time,
                gameType,
                playerCreatedID: playerID,
                userTimeZone,
            };

            axios.post('http://localhost:5001/api/newGame', data)
        };
        


        
         
        /*
        const addGameToPlayersConfirmedGames = async ( longitude, latitude, gamesCollectionRef, pendingGamesCollectionRef, currentPlayerDocumentID, currentPlayerOverall ) => {

            const coordinates = new GeoPoint(Number(latitude), Number(longitude));
            const addressString = formData.streetAddress;
            const date = formData.dateOfGame;
            const time = formData.timeOfGame;
            const gameType = formData.gameType;
            const playerID = currentPlayerDocumentID
            const userDateTime = new Date(`${date}T${time}`);
            const utcDateTime = userDateTime.toUTCString();     
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            if (userDateTime < new Date()) {
                console.log("Cannot add game in the past");
                return;
            }
        
            const addTeammatesToGame = async (gameCollectionRef, playerID) => {
                try {
                    await addDoc(gameCollectionRef, {
                        coordinates, 
                        addressString, 
                        dateOfGame: utcDateTime, 
                        userTimeZone, 
                        gameType,
                        playerID,
                        overall: currentPlayerOverall,
                        time: time,
                        maxSpotsAvailable: gameType,
                        numSpotsTaken: 1,
                        teammates: [ playerID ]
                    });
            
                    // const teammatesCollectionRef = collection(mainDocRef, 'teammates');
                    //await addDoc(teammatesCollectionRef, { username: playerID });
                } catch (error) {
                    console.error("Error adding document: ", error);
                }
            };

            try {
                await addTeammatesToGame(gamesCollectionRef, playerID);
                await addTeammatesToGame(pendingGamesCollectionRef, playerID);
                setRefreshToken(refreshToken + 1);    
            } catch (error) {
                console.error("Error adding document: ", error);
            }
        }
        */


        const styling = {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            height: '60%',
            width: '40%',
            borderRadius: '30px',
            backgroundColor: 'black',
            border: '1px solid white',
            transition: 'opacity 0.35s ease-in-out, transform 200s ease-in',
            opacity: isVisible ? 1 : 0,
            zIndex: '999',
            padding: '50px'
        } ;
        const inputBoxStyling = {
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            marginBottom: '10px',
            width: '100%'
        };
        const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
        const gameTypes = ['1v1', '2v2', '3v3', '4v4', '5v5']

        return (
            <form style={styling} onSubmit={handleNewGameSubmission} id='createGameForm'>
            <div  className='gridContainer'>
              <div>
                <label htmlFor="streetAddress">Street Address:</label>
                <input
                  style={inputBoxStyling}
                  id="streetAddress"
                  placeholder="Street Address"
                  value={formData.streetAddress}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="city">City:</label>
                <input
                  style={inputBoxStyling}
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <div  className='gridContainer'>
              <div>
                <label htmlFor="state">State:</label>
                <select
                  style={inputBoxStyling}
                  id="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  required
                >
                  {states.map((state) => (
                    <option value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="zipcode">Zipcode:</label>
                <input
                  style={inputBoxStyling}
                  id="zipcode"
                  placeholder="Zipcode"
                  value={formData.zipcode}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <div  className='gridContainer'>
              <div>
                <label htmlFor="dateOfGame">Date of game:</label>
                <input
                  style={inputBoxStyling}
                  id="dateOfGame"
                  placeholder="Date of game"
                  type="date"
                  value={formData.dateOfGame}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="timeOfGame">Time of game:</label>
                <input
                  style={inputBoxStyling}
                  id="timeOfGame"
                  placeholder="Time of game"
                  type="time"
                  value={formData.timeOfGame}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <div className='gridContainer'>
                <div>
                    <label htmlFor="gameType">Game Type</label>
                    <select
                        style={inputBoxStyling}
                        id="gameType"
                        value={formData.gameType}
                        onChange={handleFormChange}
                        required
                        >
                        {gameTypes.map((game) => (
                            <option value={game[0]}>
                            {game}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className='gridContainer'>
                <div style={{gridColumn: 'span 2', justifySelf: 'center', alignSelf: 'center'}}>
                    <button id='create-button'>Create</button>
                </div>
            </div>
            </form>
    );
};

export { CreateGameForm };