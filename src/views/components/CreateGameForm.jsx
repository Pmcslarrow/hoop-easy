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
            const dateTimeString = `${formData.dateOfGame} ${formData.timeOfGame}`;
            const dateTime = new Date(dateTimeString);
            let userLoggedIn = auth?.currentUser;

            if (userLoggedIn) {
                const userCollection = await getDocs(usersCollectionRef);
                userCollection.forEach(async (doc) => {
                    const currentPlayerData = doc.data();
                    const currentPlayerEmail = currentPlayerData?.email;
                    const currentPlayerDocumentID = doc.id;
                    const currentPlayerOverall = currentPlayerData?.overall
                    const pendingGamesPath = `users/${currentPlayerDocumentID}/pendingGames`;
                    const pendingGamesCollectionRef = collection(db, pendingGamesPath);
                    
                    if ( currentPlayerEmail === userLoggedIn?.email ) {   

                        fetchLocationCoordinates()
                            .then(({ longitude, latitude }) => {
                                addGameToPlayersConfirmedGames( longitude, latitude, gamesCollectionRef, pendingGamesCollectionRef, currentPlayerDocumentID, currentPlayerOverall )
                                toggleCreateGame()
                            })
                            .catch((error) => {
                                console.error(error.message);
                            });

                    }
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
                country: 'US'
            };
            const API_START = 'https://geocode.maps.co/search'

        
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


        const addGameToPlayersConfirmedGames = async ( longitude, latitude, gamesCollectionRef, pendingGamesCollectionRef, currentPlayerDocumentID, currentPlayerOverall ) => {

            const coordinates = new GeoPoint(Number(latitude), Number(longitude));
            const addressString = formData.streetAddress
            const dateOfGame = formData.dateOfGame
            const time = formData.timeOfGame
            const gameType = '1'
            const playerID = currentPlayerDocumentID

            const DATA_UPLOAD = {
                coordinates, 
                addressString, 
                dateOfGame, 
                time, 
                gameType, 
                playerID,
                overall: currentPlayerOverall
            }

            console.log("Uploading new game: ", DATA_UPLOAD)

            try {
                await addDoc(gamesCollectionRef, DATA_UPLOAD);
                await addDoc(pendingGamesCollectionRef, DATA_UPLOAD)
                setRefreshToken(refreshToken + 1)
            } catch (error) {
                console.error("Error adding document: ", error);
            }
        }
    
        
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
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.35s ease-in-out, transform 0.25s ease-in',
            padding: '50px',
            paddingTop: '100px',
            paddingBottom: '100px',
            boxShadow: '0px 0px 20px 10px rgba(250, 70, 47, 0.625)',
            zIndex: '999'  
        };

        const inputBoxStyling = {
            padding: '12px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            fontSize: '16px',
            marginBottom: '10px',
            width: '100%'
        };

        const gridStyling = {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridGap: '10px'
        };
           
               
        const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
       
        return (
            <form style={styling} onSubmit={handleNewGameSubmission}>
            <div style={gridStyling}>
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
            <div style={gridStyling}>
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
            <div style={gridStyling}>
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
            <div style={{...gridStyling}}>
                <div style={{gridColumn: 'span 2', justifySelf: 'center', alignSelf: 'center'}}>
                    <button
                        style={{
                            padding: '25px',
                            fontSize: '40px',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            background: 'linear-gradient(90deg, rgba(250, 70, 47, 0.625), rgba(175, 25, 5, 0.625))',
                            border: '1px solid white'
                        }}
                        id='create-button'
                    >
                        Create
                    </button>
                </div>
            </div>

            </form>
        );
};

export { CreateGameForm };