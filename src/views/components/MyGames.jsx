import React, { useEffect, useState, useCallback } from 'react';
import { getDocs, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import setGridStyle from '../functions/setGridStyle';
import missingImage from '../../images/missingImage.jpg'
import { FirebaseQuery } from '../functions/FirebaseQuery'
import { auth } from '../../config/firebase'

/* Components */
import Teammates  from './Teammates'
import VerifyGameComponent from './VerifyGameComponent';
import ScoreInputComponent from './ScoreInputComponent';

const MyGames = ({ props }) => {
    const { db, currentUser, setRefreshToken, refreshToken } = props;
    const [verifiedGames, setVerifiedGames] = useState([])
    const [pendingGames, setPendingGames] = useState([])
    const [confirmedGames, setConfirmedGames] = useState([])
    const query = new FirebaseQuery(auth, db, null, currentUser)

    const boldItalicStyle = { fontFamily: 'var(--font-bold-italic)'}
    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);
    const myGamesLocation = setGridStyle(2, 6, 12, 30, undefined, undefined, undefined)
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(30, 1fr)',
        gap: '10px',
    };

    function convertToLocalTime( storedUtcDateTime ) {
        const userLocalDateTime = new Date(storedUtcDateTime);
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userDateTimeString = userLocalDateTime.toLocaleString('en-US', { timeZone: userTimeZone });
        return userDateTimeString
    }

    // Finds the verified games, confirmed games, and pending games from the passed in prop. (sorts in that order for rendering below)
    useEffect(() => {
        const confimedGamesAwaitingUserInput = []
        const confirmedGamesAwaitingScoreVerification = []

        const getPendingGames = async() => {
            let pendingGames = await query.getPendingGames(currentUser.id)
            pendingGames = pendingGames.map((game) => { 
                game.time = convertToLocalTime(game.dateOfGame);
                return game;
            }) 
            setPendingGames(pendingGames)
        }
        const getConfirmedGames = async() => {
            const confirmedGames = await query.getConfirmedGames( currentUser.id )
            confirmedGames.forEach((game) => { 
                if (!game.gameApprovalStatus && (game?.score?.playerScore || game?.score?.opponentScore)) {
                    game.time = convertToLocalTime(game.dateOfGame)
                    confirmedGamesAwaitingScoreVerification.push(game)
                } else {
                    game.time = convertToLocalTime(game.dateOfGame)
                    confimedGamesAwaitingUserInput.push(game)
                }
            })
            setConfirmedGames(confimedGamesAwaitingUserInput)
            setVerifiedGames(confirmedGamesAwaitingScoreVerification)
        }

        getPendingGames()
        getConfirmedGames()
    }, [])


    const PendingGameApproval = () => {
        return ( 
            <div style={{display: 'flex', justifyContent: 'center', gap: '10px'} }>
                <div>Waiting for the score to be approved by your opponent...</div>

                <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'end', gap: '5px'}}>
                    <div className='el'></div>
                    <div className='el'></div>
                    <div className='el'></div>
                </div>
            </div>
        )        
    }

    // If the game is confirmed, it will show pending, otherwise it will let you submit the scores
    const Card = ({ currentCard, type, isVerified }) => {
    
        const renderScoreSubmission = () => {
          if (type === 'confirmed') {
            return (
              <>
                {currentCard.gameApprovalStatus && <PendingGameApproval />}
                {!currentCard.gameApprovalStatus && (currentCard?.score?.playerScore || currentCard?.score?.opponentScore) && <VerifyGameComponent props={{ currentCard, currentUser, refreshToken, setRefreshToken }}/>}
                {!currentCard.gameApprovalStatus && !(currentCard?.score?.playerScore || currentCard?.score?.opponentScore) && <ScoreInputComponent props={{currentCard, currentUser, refreshToken, setRefreshToken}}/>}
              </>
            );
          }
          return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <div>Waiting for the game to be accepted by other players</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'end', gap: '5px' }}>
                <div className='el'></div>
                <div className='el'></div>
                <div className='el'></div>
              </div>
            </div>
          );
        };

        const [dateOfGame, timeOfGame] = currentCard.time.split(',');
        const trimmedDateOfGame = dateOfGame.trim();
        const trimmedTimeOfGame = timeOfGame.trim();
        
        return (
          <li className='card'>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...boldItalicStyle }}>
              <div>{currentCard.gameType}v{currentCard.gameType}</div>
              <div>
                <div>{trimmedDateOfGame}</div>
                <div>{trimmedTimeOfGame}</div>
              </div>
            </div>
            <div className='opponentText' style={{ padding: '20px'}}>
                <Teammates game={currentCard}/>
            </div>
            <div className='addressText'>{currentCard.addressString}</div>
            {renderScoreSubmission()}
          </li>
        );
    };
            

    /*
    const gamesAwaitingOpponentScoreVerification = []
    const gamesAwaitingUserInput = []

    confirmedGames.forEach((game) => {
        if ( game?.score?.playerScore || game?.score?.opponentScore ) {
            gamesAwaitingOpponentScoreVerification.push(game)
        } else {
            gamesAwaitingUserInput.push(game)
        }
    })
    */

    /*
        Order of games appearing should be:
            1) verified games --> Games that the opponent has submit a score for, and you the user need to verify the score on your end
            2) gamesAwaitingUserInput --> Games that have been accepted but that either you or your opponent need to submit scores
            3) gamesAwaitingOpponentScoreVerification --> Games that are awaiting opponent approval of the score
            4) pendingGames --> Games that you created that have not been picked up by anyone yet
    */

    return (
        <section id="my-games" style={gridStyle}>
            <h1 style={h1Style}>My Games</h1>
            <div style={horizontalLine}></div>

            <div id='myGamesContainer' style={myGamesLocation}>
            <ul className="cards" >
                {verifiedGames.map((currentCard, i) => (
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type='confirmed' isVerified={true}/>  
                ))}
                {confirmedGames.map((currentCard, i) => (
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type='confirmed'/>  
                ))}
                {pendingGames.map((currentCard, i) => (
                    <Card key={`pending-${i}`} currentCard={currentCard} type='pending' />  
                ))}
                
            {/*
                {verifiedGames.map((currentCard, i) => (
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type='confirmed' isVerified={true}/>  
                ))}
                {gamesAwaitingUserInput.map((currentCard, i) => (
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type='confirmed'/>  
                ))}
                {gamesAwaitingOpponentScoreVerification.map((currentCard, i) => (
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type='confirmed'/>  
                ))}
                {pendingGames.map((currentCard, i) => (
                    <Card key={`pending-${i}`} currentCard={currentCard} type='pending' />  
                ))}
            */}
            </ul>

            </div>
        </section>
    )
}

export { MyGames }