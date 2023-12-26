// PlayerOverallRating.jsx
import React from 'react';
import { FirebaseQuery } from '../functions/FirebaseQuery'
import { useState, useEffect, useContext } from 'react'
import { db } from '../../config/firebase';
import { UserContext } from '../../App.js'; 


const Card = ({ props }) => {
    const { game, currentUser, refreshToken, setRefreshToken } = props;
    const query = new FirebaseQuery(null, db, game, currentUser)
    const [opacity, setOpacity] = useState(0)
    const [teammatesIdArray, setTeammatesIdArray] = useState([]);
    const MAX_PLAYERS = parseInt(game.gameType) * 2
    const CURRENT_NUMBER_TEAMMATES = teammatesIdArray && teammatesIdArray.length > 0 ? teammatesIdArray.length : 0;



    useEffect(() => {
        const getTeammatesIdArray = async () => {
            try {
                const teammates = await query.getTeammateIdArray()
                setTeammatesIdArray(teammates);
            } catch (error) {
                console.log(error);
            }
        };
    
        getTeammatesIdArray()
    }, [refreshToken]);


    const handleJoinGame = async () => {
        try {
            await query.joinGame();               
            setTeammatesIdArray([...query.teammatesIdArray]);  
                                 
            if (query.teammatesIdArray.length >= MAX_PLAYERS) {  await query.handleFullGame();  }
        
            setRefreshToken(prevToken => prevToken + 1);
        } catch (error) {
            console.log("Error handling join game:", error);
        }
    }
    
    const handleLeaveGame = async () => {
        try {
            await query.leaveGame();          
            setTeammatesIdArray([...query.teammatesIdArray]);

            if (query.teammatesIdArray.length <= 0) {  await query.handleEmptyGame();  }

            setRefreshToken(prevToken => prevToken + 1);
        } catch (error) {
            console.log("Error handling leave game:", error);
        }
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
    const disablePlayerAbilityToJoinGame = teammatesIdArray ? teammatesIdArray.some((player) => player === currentUser.id) : false;

    
    if ( CURRENT_NUMBER_TEAMMATES <= 0 ) {
        return <div style={{display: 'none'}}></div>
    }
    
    return (
        <div>
            <div id='card-outer' onMouseEnter={hover} onMouseLeave={hover} onClick={disablePlayerAbilityToJoinGame? handleLeaveGame : handleJoinGame}>
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
