// PlayerOverallRating.jsx
import React from 'react';
import { FirebaseQuery } from '../../utils/FirebaseQuery.js'
import { useState, useEffect, useContext } from 'react'
import { db, auth } from '../../config/firebase.js';
import { UserContext } from '../../App.js'; 
import missingImage from '../../assets/images/missingImage.jpg'
import axios from 'axios'


const Card = ({ props }) => {
    const { game, refreshToken, setRefreshToken } = props;
    const [teammatesIdArray, setTeammatesIdArray] = useState([]);
    const MAX_PLAYERS = parseInt(game.gameType) * 2
    const CURRENT_NUMBER_TEAMMATES = teammatesIdArray && teammatesIdArray.length > 0 ? teammatesIdArray.length : 0;
    const [opacity, setOpacity] = useState(0)
    const [profilePic, setProfilePic] = useState([])
    const [currentUserID, setCurrentUserID] = useState([])


    useEffect(() => {
        // Later on get the creator image if you want, or just design the card
        const getArrayOfTeammates = async () => {
            const result = await axios.get('http://localhost:5001/api/getTeammates', {params: game});
            const teammates = result.data[0].teammates
            const teammatesArray = Object.keys(teammates).map(key => teammates[key]);
            setTeammatesIdArray(teammatesArray)
        }
        
        const getCurrentUserID = async () => {
            const currentUserEmail = auth?.currentUser?.email
            const result = await axios.get(`http://localhost:5001/api/getCurrentUserID?email=${currentUserEmail}`);
            setCurrentUserID(result.data)
        }
                
        getArrayOfTeammates()
        getCurrentUserID()
    }, [refreshToken]);
    

    useEffect(() => {
        setProfilePic(missingImage)
        console.log("should be showing card with gameId ", game.gameID)
    }, [])

    const handleJoinGame = async () => {

        /*
        try {
            await query.joinGame();               
            setTeammatesIdArray([...query.teammatesIdArray]);  
                                 
            if (query.teammatesIdArray.length >= MAX_PLAYERS) {  await query.handleFullGame();  }
        
            setRefreshToken(prevToken => prevToken + 1);
        } catch (error) {
            console.log("Error handling join game:", error);
        }
        */
    }
    
    const handleLeaveGame = async () => {
        /*
        try {
            await query.leaveGame();          
            setTeammatesIdArray([...query.teammatesIdArray]);

            if (query.teammatesIdArray.length <= 0) {  await query.handleEmptyGame();  }

            setRefreshToken(prevToken => prevToken + 1);
        } catch (error) {
            console.log("Error handling leave game:", error);
        }
        */
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
    const disablePlayerAbilityToJoinGame = teammatesIdArray ? teammatesIdArray.some((player) => toString(player) === toString(currentUserID)) : false;

    if ( CURRENT_NUMBER_TEAMMATES <= 0 ) {
        return <div style={{display: 'none'}}></div>
    }

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
                    <h4>{game.username}</h4>
                    <p>{game.addressString}</p>
                    <p>{game.time}</p>
                </div>
                <div id='subtext-right'>
                    <p>{game.overall} Overall</p>
                    <p>{game.distance.toFixed(2)} Miles</p>
                    <p>{game.gameType}v{game.gameType}</p>
                </div>
            </div>
        </div>
    );
};

export { Card };
