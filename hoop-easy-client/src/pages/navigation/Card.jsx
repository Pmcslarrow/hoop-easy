// PlayerOverallRating.jsx
import React from 'react';
import { FirebaseQuery } from '../../utils/FirebaseQuery.js'
import { useState, useEffect, useContext } from 'react'
import { db, auth } from '../../config/firebase.js';
import { UserContext } from '../../App.js'; 
import missingImage from '../../assets/images/missingImage.jpg'
import { convertToLocalTime } from '../../utils/locationTimeFunctions.js';
import axios from 'axios'


const Card = ({ props }) => {
    const { game, refreshToken, setRefreshToken } = props;
    const [teammatesIdArray, setTeammatesIdArray] = useState([]);
    const MAX_PLAYERS = parseInt(game.gameType) * 2
    const CURRENT_NUMBER_TEAMMATES = teammatesIdArray && teammatesIdArray.length > 0 ? teammatesIdArray.length : 0;
    const [opacity, setOpacity] = useState(0)
    const [profilePic, setProfilePic] = useState([])
    const [currentUserID, setCurrentUserID] = useState([])
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    const handleResize = () => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });

        if ( window.innerWidth < 950 ) {
            setOpacity(1)
        }
    }

    useEffect(() => {
        const getArrayOfTeammates = async () => {
            try {
                const result = await axios.get('http://localhost:5001/api/getTeammates', { params: game });        
                if (result.data && result.data[0] && result.data[0].teammates) {
                    const teammates = result.data[0].teammates;
                    const teammatesArray = Object.keys(teammates).map(key => teammates[key]);
                    setTeammatesIdArray(teammatesArray);
                } else {
                    console.error('Unexpected response structure:', result.data);
                }
            } catch (error) {
                console.error('Error fetching teammates:', error);
            }
        };
        
        
        const getCurrentUserID = async () => {
            const currentUserEmail = auth?.currentUser?.email
            if (currentUserEmail !== undefined) {
                const result = await axios.get(`http://localhost:5001/api/getCurrentUserID?email=${currentUserEmail}`);
                setCurrentUserID(result.data)
            }
        }
                
        getArrayOfTeammates()
        getCurrentUserID()
        window.addEventListener("resize", handleResize, false);
    }, [refreshToken]);
    

    useEffect(() => {
        setProfilePic(missingImage)
        console.log("should be showing card with gameId ", game.gameID)
    }, [])


    const handleJoinGame = async () => {
        try {

            let newSizeOfTeammates = teammatesIdArray.length += 1;
            teammatesIdArray.push(currentUserID)
            const newTeammatesIdArray = teammatesIdArray
            const newJSONTeammates = createTeammateJsonFromArray(newTeammatesIdArray)
            await axios.put(`http://localhost:5001/api/updateTeammates?gameID=${game.gameID}&teammateJson=${newJSONTeammates}`)
            
            if (isFull(newSizeOfTeammates)){
                await axios.put(`http://localhost:5001/api/updateStatus?gameID=${game.gameID}&status=confirmed`)
            }
            setRefreshToken(refreshToken + 1)
            return
        } catch (err) {
            console.log("Error trying to join game: ", err)
        }
    }
    

    const handleLeaveGame = async () => {
        const sizeOfArrayAfterRemoval = teammatesIdArray.length - 1
        const newTeammatesIdArray = teammatesIdArray.filter(id => id.toString() !== currentUserID.toString());
        
        if (isEmpty(sizeOfArrayAfterRemoval)) {
            await axios.delete(`http://localhost:5001/api/deleteGame?gameID=${game.gameID}`)
            setRefreshToken(refreshToken + 1)
            return
        }

        const newJSONTeammates = createTeammateJsonFromArray(newTeammatesIdArray)
        await axios.put(`http://localhost:5001/api/updateTeammates?gameID=${game.gameID}&teammateJson=${newJSONTeammates}`);
        setRefreshToken(refreshToken + 1)
        return
    }


    const isEmpty = (size) => {
        return size <= 0
    }

    const isFull = (size) => {
        return size === MAX_PLAYERS
    }

    // @input: ['2', '3']
    // @return: '{"teammate0": "1", "teammate1": "2"}'
    const createTeammateJsonFromArray = (array) => {
        const jsonArray = []
        console.log(array)
        for (let i=0; i<array.length; i++) {
            if (array[i] !== undefined) {
                const string = `"teammate${i}": "${array[i]}"`
                jsonArray.push(string)
            }
        }
        const jsonInside = jsonArray.join(', ')
        const json = '{' + jsonInside + '}'
        return json
    }
  
    const hover = () => {
        if ( opacity === 0 ) {
            setOpacity(1)
        } else {
            setOpacity(0)
        }
    }

    const playerSlots = Array.from({ length: MAX_PLAYERS }, (_, index) => {
        const className = index < CURRENT_NUMBER_TEAMMATES ? 'taken' : 'open';        
        return <div key={index} className={className}></div>;
    });

    // We disable the player's ability to join a game if they are already a teammate of the game -- So they can leave the game instead
    const disablePlayerAbilityToJoinGame = teammatesIdArray ? teammatesIdArray.some((player) => player.toString() === currentUserID.toString()) : false;

    if ( CURRENT_NUMBER_TEAMMATES <= 0 ) {
        return <div style={{display: 'none'}}></div>
    }
    
    const convertedDateTime = convertToLocalTime(game.dateOfGameInUTC)

    return (
        <div>
            <div 
                id='card-outer' onMouseEnter={hover} onMouseLeave={hover} onClick={disablePlayerAbilityToJoinGame? handleLeaveGame : handleJoinGame} 
                style={{ 
                    backgroundImage: `url(${profilePic})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    borderRadius: '10px'
                }}              
            >
                <div>
                    <span className="card-text" style={{opacity: opacity === 0 ? 1 : 0}}></span>
                    <span className='accept-text' style={{opacity: opacity === 0 ? 0 : 1}}>
                        {disablePlayerAbilityToJoinGame ? 'LEAVE' : 'JOIN'}
                        <div className='slots'>
                            {playerSlots}
                        </div>
                    </span>
                </div>
            </div>
            <div id='subtext'>
                <div id='subtext-left'>
                    <p>{game.address}</p>
                    <p>{convertedDateTime}</p>
                </div>
                <div id='subtext-right'>
                    <p>{game.distance.toFixed(2)} Miles</p>
                    <p>{game.gameType}v{game.gameType}</p>
                </div>
            </div>
        </div>
    );
};

export { Card };
