import React, { useState, useEffect } from 'react';
import { collection, GeoPoint, addDoc, getDocs } from 'firebase/firestore';
import {localToUTC} from '../../utils/locationTimeFunctions'
import GoogleNavigation from './GoogleNavigation';
import axios from 'axios';

const CreateGameForm = ( props ) => {
    const { auth, setRefreshToken, setCreateGameActive, isCreateGameActive } = props;
    const [gameLocation, setGameLocation] = useState("")
    const [coordinates, setCoordinates] = useState({
        longitude: 0,
        latitude: 0
    })
    const [placeSelection, handlePlaceSelection] = useState({})
    
    useEffect(() => {
        setGameLocation(placeSelection.formatted_address)
        setCoordinates({
            longitude: placeSelection?.geometry?.location?.lng(),
            latitude: placeSelection?.geometry?.location?.lat()
        })
    }, [placeSelection])

    function toggleCreateGame() {
        setCreateGameActive(!isCreateGameActive)
    }

    const [isVisible, setIsVisible] = useState(false);
        const [formData, setFormData] = useState({
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
                const loggedInUser = await axios.get(`https://hoop-easy-production.up.railway.app/api/getUser?email=${userLoggedIn?.email}`);
            
                if (!gameLocation || !formData.dateOfGame || !formData.timeOfGame || !formData.gameType) {
                    console.log("Required fields are empty");
                    return;
                }
                
                const addressString = gameLocation;
                const date = formData.dateOfGame;
                const time = formData.timeOfGame;
                const gameType = formData.gameType;
                const playerID = loggedInUser.data.id;
                const userDateTime = new Date(`${date} ${time}`);
                const dateOfGame = localToUTC(userDateTime)
                const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const teammates = { playerID };
                
                if (userDateTime < new Date()) {
                    console.log("Cannot add game in the past");
                    return;
                }
                
                const data = {
                    userID: playerID,
                    address: addressString,
                    longitude: coordinates.longitude,
                    latitude: coordinates.latitude,
                    dateOfGame: dateOfGame,
                    timeOfGame: time,
                    gameType,
                    playerCreatedID: playerID,
                    userTimeZone,
                };
    
                axios.post('https://hoop-easy-production.up.railway.app/api/newGame', data)
                toggleCreateGame()
            } else {
                console.log("No user signed in");
            }
        };    
                
        const styling = {
            opacity: isVisible ? 1 : 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        };
        const inputStyle = {
            padding: '10px',
            width: '95%'
        }

        const gameTypes = ['1v1', '2v2', '3v3', '4v4', '5v5']

        return (
            <form style={styling} onSubmit={handleNewGameSubmission} id='createGameForm'>              
                    <div>
                        <GoogleNavigation handlePlaceSelection={handlePlaceSelection}/>
                    </div>
                    <div>
                        <input
                            id="dateOfGame"
                            placeholder="Date of game"
                            type="date"
                            style={inputStyle}
                            value={formData.dateOfGame}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            id="timeOfGame"
                            placeholder="Time of game"
                            type="time"
                            style={inputStyle}
                            value={formData.timeOfGame}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div>
                    <div>
                        <select
                            id="gameType"
                            value={formData.gameType}
                            onChange={handleFormChange}
                            style={inputStyle}
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
                <button id='create-button'>Create</button>
            </form>
    );
};

export { CreateGameForm };