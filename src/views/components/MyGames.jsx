import React, { useEffect, useState, useCallback } from 'react';
import { getDocs, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import setGridStyle from '../setGridStyle';
import missingImage from '../../images/missingImage.jpg'

const MyGames = ( props ) => {
    const { db, currentUser, currentUserID, setRefreshToken, refreshToken, myPendingGames, myConfirmedGames } = props 
    const [verifiedGames, setVerifiedGames] = useState([])
    const [pendingGames, setPendingGames] = useState([])
    const [confirmedGames, setConfirmedGames] = useState([])

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
        const pendingGames = []
        const confimedGames = []
        const gamesThatAreInVerifcationStage = []
        myConfirmedGames.forEach((game) => { 
            if (!game.gameApprovalStatus && (game?.score?.playerScore || game?.score?.opponentScore)) {
                game.time = convertToLocalTime(game.dateOfGame)
                gamesThatAreInVerifcationStage.push(game)
            } else {
                game.time = convertToLocalTime(game.dateOfGame)
                confimedGames.push(game)
            }
        })
        myPendingGames.forEach((game) => { 
            game.time = convertToLocalTime(game.dateOfGame)
            pendingGames.push(game)
        })

        setVerifiedGames(gamesThatAreInVerifcationStage)
        setConfirmedGames(confimedGames)
        setPendingGames(pendingGames)

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

    const VerifyGameComponent = ({ currentCard }) => {
        const flexRow = {
            display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '5px'
        }

        // Player A should be current player and Player B should be opponent
        // Returns { player A new rating, player B new rating}
        function ratingAlgorithm( player_A, player_B, score_A, score_B ) {
            let R_A, R_B, Q_A, Q_B, E_A, E_B, S_A, S_B, new_R_A, new_R_B
            const c = 400

            R_A = parseFloat(player_A.overall)
            R_B = parseFloat(player_B.overall)

            Q_A = 10**(R_A/c)
            Q_B = 10**(R_B/c)

            E_A = Q_A/(Q_A + Q_B)
            E_B = 1 - E_A

            if ( score_A > score_B ) {
                S_A = 1
                S_B = 0
            } else if ( score_B > score_A ) {
                S_A = 0
                S_B = 1
            } else {
                S_A= 0
                S_B = 0
            }

            function calculate_k_scale(games_played) {
                const k_scaler = { 10: 4, 25: 2, 50: 1, 100: 0.5 };
            
                for (const threshold in k_scaler) {
                    if (games_played <= parseInt(threshold)) {
                        return k_scaler[threshold];
                    }
                }

                if ( games_played >= 100 ) {
                    return 0.3
                }

                return null
        
            }

            function calculate_l_scale(games_played) {
                const l_scaler = { 10: 2, 25: 1, 50: 0.5, 100: 0.25 };
            
                for (const threshold in l_scaler) {
                    if (games_played <= parseInt(threshold)) {
                        return l_scaler[threshold];
                    }
                }

                if ( games_played >= 100 ) {
                    return 0.2
                }
                return null; 
            }

            // Calculating K
            let player_A_games_played = parseInt(player_A.gamesPlayed)
            let player_B_games_played = parseInt(player_B.gamesPlayed)
            let k_A = calculate_k_scale(player_A_games_played)
            let k_B = calculate_k_scale(player_B_games_played)
            let l_A = calculate_l_scale(player_A_games_played)
            let l_B = calculate_l_scale(player_B_games_played)

            new_R_A = R_A + k_A*(S_A-E_A) + l_A*(score_A/(score_A + score_B)) 
            new_R_B = R_B + k_B*(S_B-E_B) + l_B*(score_B/(score_A + score_B))
            
            new_R_A = Number.parseFloat(new_R_A).toFixed(2)
            new_R_B = Number.parseFloat(new_R_B).toFixed(2)

            return { new_R_A, new_R_B }
        }

        async function findConfirmedGameID(ref, dataToMatchOn) {
            try {
                const confirmedGames = await getDocs(ref);
                const filteredConfirmedGames = confirmedGames.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        
                for (const game of filteredConfirmedGames) {
                    if (
                        game.dateOfGame === dataToMatchOn.dateOfGame &&
                        game.coordinates._lat === dataToMatchOn.coordinates._lat &&
                        game.coordinates._long === dataToMatchOn.coordinates._long &&
                        game.playerID === dataToMatchOn.opponentID &&
                        game.time === dataToMatchOn.time
                    ) {
                        return game.id;
                    }
                }
        
                // If no match is found, you might want to return something, e.g., null
                return null;
            } catch (error) {
                console.error("Error in findConfirmedGameID:", error);
                throw error; // Re-throw the error to indicate that something went wrong
            }
        }                

        const handleAccept = async () => {
            let opponentCard = currentCard
            const opponentDocRef = doc(db, `users/${opponentCard.playerID}`);
            const currentUserDocRef = doc(db, `users/${currentUser.id}`);
            const opponentHistoryRef = collection(db, `users/${opponentCard.playerID}/history`);
            const currentUserHistoryRef = collection(db, `users/${currentUser.id}/history`);
            const opponentConfirmedGamesRef = collection(db, `users/${opponentCard.opponentID}/confirmedGames`)
            const currentUserConfirmedGamesRef = collection(db,  `users/${currentUser.id}/confirmedGames`)

            let opponentScore = parseInt(opponentCard?.score?.opponentScore)
            let currentUserScore = parseInt(opponentCard?.score?.playerScore)

            let newOverallRatings = ratingAlgorithm(currentUser, opponentCard, currentUserScore, opponentScore)
            let currentUserNewOverallRating = Math.max(60, Math.min(99, newOverallRatings.new_R_A));
            let opponentNewOverallRating = Math.max(60, Math.min(99, newOverallRatings.new_R_B));


            const {
                addressString,
                coordinates,
                dateOfGame,
                time,
                opponentID,
                //score,
                //opponent,
                //gameApprovalStatus,
                //username,
                //gameType,
                //...restOpponentCard
            } = opponentCard;

            const dataForOpponentCollection = {
                //...restOpponentCard,
                gamesAccepted: String(parseInt(opponentCard.gamesAccepted) + 1),
                gamesPlayed: String(parseInt(opponentCard.gamesPlayed) + 1),
                overall: String(opponentNewOverallRating) 
            };
            const dataForCurrentUserCollection = {
                //...currentUser,
                gamesAccepted: String(parseInt(currentUser.gamesAccepted) + 1),
                gamesPlayed: String(parseInt(currentUser.gamesPlayed) + 1),
                overall: String(currentUserNewOverallRating) 
            };
            const dataForOpponentHistoryCollection = {
                addressString,
                coordinates,
                dateOfGame,
                time,
                yourScore: opponentCard.score.opponentScore,
                opponentScore: opponentCard.score.playerScore,
                ratingBeforeGame: opponentCard.overall,
                ratingAfterGame: opponentNewOverallRating,
                opponent: currentUser.username
            }
            const dataForCurrentPlayerHistoryCollection = {
                addressString,
                coordinates,
                dateOfGame,
                time,
                yourScore: opponentCard.score.playerScore,
                opponentScore: opponentCard.score.opponentScore,
                ratingBeforeGame: currentUser.overall,
                ratingAfterGame: currentUserNewOverallRating,
                opponent: opponentCard.username
            }

            // Update user data
            const updatingUserData = async () => {
                try {
                    await updateDoc(opponentDocRef, dataForOpponentCollection);
                    await updateDoc(currentUserDocRef, dataForCurrentUserCollection);
                    console.log("Data updated successfully");
                } catch (error) {
                    console.error("Error updating user data:", error);
                }
            };
            
        
            // Add entry into history collection
            const addingHistory = async () => {

                try {
                    await addDoc(opponentHistoryRef, dataForOpponentHistoryCollection);
                    await addDoc(currentUserHistoryRef, dataForCurrentPlayerHistoryCollection);
            
                    console.log("History added successfully");
                } catch (error) {
                    console.error("Error adding history:", error);
                }
            };
            
            // Remove the confirmed game from both
            const deletingConfirmedGames = async () => {
                try {
                    const confirmedGameID = await findConfirmedGameID(opponentConfirmedGamesRef, { coordinates, dateOfGame, time, opponentID });
                
                    if (confirmedGameID) {
                        const opponentConfirmedGameDocRef = doc(opponentConfirmedGamesRef, confirmedGameID);
                        const currentUserConfirmedGameDocRef = doc(currentUserConfirmedGamesRef, opponentCard.id)
                        console.log(`Trying to delete opponent confirmedGame with ${confirmedGameID}`)
                        console.log(`Trying to delete jrae confirmedGame with ${opponentCard.id}`)

                        await deleteDoc(opponentConfirmedGameDocRef);
                        await deleteDoc(currentUserConfirmedGameDocRef)
                        console.log(`Confirmed Game Successfully Deleted.`);
                    } else {
                        console.log("No matching document found to delete.");
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            }

            Promise.all([updatingUserData(), addingHistory(), deletingConfirmedGames()])
            .then(() => {
                setRefreshToken(refreshToken + 1);
            })
            .catch((error) => {
                console.error("Error in one or more async functions:", error);
            });   

        }
        const handleDeny = () => {
            console.log(`
            Handle score denial --> 
            Remove from the confirmedGames collection for both users,
            Has no effect on either player's elo.
            update gamesDenied`)
            let opponentCard = currentCard
            console.log(opponentCard, currentUser)
        }

        const center = { position: 'relative', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', ...boldItalicStyle}

        return (
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '10px'}}>
                <div style={flexRow}>
                    <div style={{...flexRow, ...boldItalicStyle, color: 'gray'}}>
                        <div>YOU</div>
                    </div>
                    <div style={{...flexRow, ...boldItalicStyle, fontSize: '36px'}}>
                        <div>{currentCard.score.playerScore}</div>
                        :
                        <div>{currentCard.score.opponentScore}</div>
                    </div>
                    <div style={{...flexRow, ...boldItalicStyle, color: 'gray'}}>
                        <div>OPP</div>
                    </div>
                </div>
                <div style={flexRow}>
                    <div id='accept-button' onClick={handleAccept}>
                        <div style={center}>
                            Accept
                        </div>
                    </div>
                    <div id='deny-button' onClick={handleDeny}>
                        <div style={center}>
                            Deny
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const handleScoreSubmission = async ( currentCard, scoreData ) => {

        const { userScore, opponentScore } = scoreData
        if ( !userScore || !opponentScore ) {
            console.log("Please fill out the game info.")
            return
        }

        const dataForCurrentPlayerCollection = {
            ...currentCard,
            playerID: currentUser.id,
            score: {
                playerScore: userScore,
                opponentScore: opponentScore
            },
            gameApprovalStatus: true,
        };

        const dataForOpponentCollection = {
            ...currentUser,
            opponentID: currentUser.id,
            opponent: currentUser.username,
            email: currentUser.email,
            firstName: currentUser.firstName,
            heightFt: currentUser.heightFt,
            heightInches: currentUser.heightInches,
            playerID: currentCard.playerID,
            lastName: currentUser.lastName,
            score: {
                playerScore: opponentScore,
                opponentScore: userScore
            },
            gameApprovalStatus: false
        };

        const playerDocID = currentCard.id;
        const playerDocRef = doc(db, `users/${currentUserID}/confirmedGames`, playerDocID);
        const opponentConfirmed = collection(db, `users/${currentCard.opponentID}/confirmedGames`);
        const opponentConfirmedSnapshot = await getDocs(opponentConfirmed);

        let opponentDoc = opponentConfirmedSnapshot.docs.find((doc) => {
            const currDoc = doc.data();
            
            return currDoc.dateOfGame === currentCard.dateOfGame &&
            currDoc.time === currentCard.time &&
            currDoc.addressString === currentCard.addressString;
        });
            
        
        if (opponentDoc) {
            await updateDoc(opponentDoc.ref, dataForOpponentCollection);
            await updateDoc(playerDocRef, dataForCurrentPlayerCollection);
            } else {
            console.log("Something went wrong while submitting the game")
         }     
            
        setRefreshToken(refreshToken + 1)

    };

    const ScoreInputComponent = ({currentCard}) => {
        const [scoreData, setScoreData] = useState({
            userScore: '',
            opponentScore: ''
          });

          const handleUserScoreChange = useCallback((event) => {
            let { value } = event.target;
            value = parseInt(value, 10);
            value = Math.min(Math.max(value, 0), 99);
            setScoreData((prevData) => ({ ...prevData, userScore: value }));
          }, []);
          
          const handleOpponentScoreChange = useCallback((event) => {
            let { value } = event.target;
            value = parseInt(value, 10);
            value = Math.min(Math.max(value, 0), 99);
            setScoreData((prevData) => ({ ...prevData, opponentScore: value }));
          }, []);
          

        return (        
        <>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px'}}>
                <input
                    id='userScore'
                    type='number'
                    placeholder='Your score'
                    onChange={handleUserScoreChange}
                    value={scoreData.userScore}
                    min='0'
                    max='99'
                    className='placeholderStyle'
                />
                :
                <input
                    id='opponentScore'
                    type='number'
                    placeholder='Opponent score'
                    onChange={handleOpponentScoreChange}
                    value={scoreData.opponentScore}
                    min='0'
                    max='99'
                    className='placeholderStyle'
                />
            </div>
            <div>
            <button onClick={() => handleScoreSubmission(currentCard, scoreData)} id='submitScoreButton'>Submit Score</button>
            </div>
        </>
        )
    }
    
    // If the game is confirmed, it will show pending, otherwise it will let you submit the scores
    const Card = ({ currentCard, type, isVerified }) => {

        const PingCircle = ({ isVerified }) => {
            const circleStyle = {
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '25px',
              height: '25px',
              backgroundColor: '#ec432d',
              borderRadius: '50%',
              willChange: 'transform', // Hint to the browser for animation optimization
              transition: isVerified ? 'transform 1.5s ease-in-out infinite' : 'none',
            };
          
            return (
              <div className={`verification-dot ${isVerified ? 'ping' : ''}`} style={circleStyle} />
            );
        };
          
    
        const renderScoreSubmission = () => {
          if (type === 'confirmed') {
            return (
              <>
                {currentCard.gameApprovalStatus && <PendingGameApproval />}
                {!currentCard.gameApprovalStatus && (currentCard?.score?.playerScore || currentCard?.score?.opponentScore) && <VerifyGameComponent currentCard={currentCard}/>}
                {!currentCard.gameApprovalStatus && !(currentCard?.score?.playerScore || currentCard?.score?.opponentScore) && <ScoreInputComponent currentCard={currentCard}/>}
              </>
            );
          }
          return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <div>Waiting for the game to be accepted by another user</div>
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
          <li className='card' style={{ padding: '20px', position: 'relative' }}>
            {/*<PingCircle isVerified={isVerified}/>*/}
            <div style={{ display: 'flex', justifyContent: 'space-between', ...boldItalicStyle }}>
              <div>{currentCard.gameType}v{currentCard.gameType}</div>
              <div>
                <div>{trimmedDateOfGame}</div>
                <div>{trimmedTimeOfGame}</div>
              </div>
            </div>
            <div style={{ alignItems: 'center' }}>
              <img
                src={missingImage}
                alt={'Profile img'}
                style={{
                  borderRadius: '5px',
                  overflow: 'hidden',
                  width: '50%',
                  padding: '5px',
                  background: `linear-gradient(135deg, rgba(250, 70, 47, 1) 0%, rgba(0, 0, 0, 0.55) 100%)`
                }}
              />
            </div>
            <div className='opponentText'>{currentCard?.opponent}</div>
            <div className='addressText'>{currentCard.addressString}</div>
            {renderScoreSubmission()}
          </li>
        );
    };
            

    const gamesAwaitingOpponentScoreVerification = []
    const gamesAwaitingUserInput = []

    confirmedGames.forEach((game) => {
        if ( game?.score?.playerScore || game?.score?.opponentScore ) {
            gamesAwaitingOpponentScoreVerification.push(game)
        } else {
            gamesAwaitingUserInput.push(game)
        }
    })

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
                {gamesAwaitingUserInput.map((currentCard, i) => (
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type='confirmed'/>  
                ))}
                {gamesAwaitingOpponentScoreVerification.map((currentCard, i) => (
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type='confirmed'/>  
                ))}
                {pendingGames.map((currentCard, i) => (
                    <Card key={`pending-${i}`} currentCard={currentCard} type='pending' />  
                ))}
            </ul>

            </div>
        </section>
    )
}

export { MyGames }