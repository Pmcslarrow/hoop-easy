import React, { useState } from 'react';
import { getDocs, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import setGridStyle from '../setGridStyle';
import missingImage from '../../images/missingImage.jpg'

const MyGames = ( props ) => {
    const { db, currentUser, currentUserID, setRefreshToken, refreshToken, myPendingGames, myConfirmedGames } = props 
    
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(30, 1fr)',
        gap: '10px',
    };

    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);
    // const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
    const myGamesLocation = setGridStyle(2, 8, 12, 28, undefined, undefined, undefined)

    const ScoreSubmissionComponent = ({ currentCard }) => {
        const [scoreData, setScoreData] = useState({
          userScore: '',
          opponentScore: ''
        });

        const handleScoreChange = (event) => {
          const { id, value } = event.target;
          
          try {

            if ( value > 99 ) {
                setScoreData((prevData) => ({
                    ...prevData,
                    [id]: 99,
                  }));
                  return
            } else {
                setScoreData((prevData) => ({
                    ...prevData,
                    [id]: value,
                  }));
            }
          } catch (err) {
            console.log(err)
          }    

        };
        const handleScoreSubmission = async () => {
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
            

            // 1) Set this player's gameApprovalPending status to true and add the score to their collection
            // 2) Set the opponent's gameApprovalPending status to false and add the score to their collection
            // 3) If the gameApprovalPending is true --> just return a pending ...
            // 4) If the gameApprovalPending is false AND the scores are there --> return Accept or Deny
            // 5) If the gameApprovalPending is false AND the the scores are NOT there --> Go through the same logic as now
        };

        const PendingComponent = () => {
            return <div>Waiting for opponent approval...</div>
        }

        // Accept and Deny handling
        const VerifyGameComponent = () => {
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
                let currentUserNewOverallRating = newOverallRatings.new_R_A
                let opponentNewOverallRating = newOverallRatings.new_R_B


                /* CRUD data for handling accept */
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
                    opponent: currentUser.email
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
                    opponent: opponentCard.email
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

            return (
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '10px'}}>
                    <div style={flexRow}>
                        <div style={flexRow}>
                            <div>Your Score:</div>
                            <div>{currentCard.score.playerScore}</div>
                        </div>
                        <div style={flexRow}>
                            <div>Opponent score:</div>
                            <div>{currentCard.score.opponentScore}</div>
                        </div>
                    </div>
                    <div style={flexRow}>
                        <div id='accept-button' onClick={handleAccept}>Accept</div>
                        <div id='deny-button' onClick={handleDeny}>Deny</div>
                    </div>
                </div>
            )
        }

        const ScoreInputComponent = () => {
            return (        
            <>
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px'}}>
                    <input
                        id='userScore'
                        type='number'
                        placeholder='Your score'
                        onChange={handleScoreChange}
                        value={scoreData.userScore}
                        min='0'
                        max='99'
                        className='placeholderStyle'
                        style={{width: '100%'}}
                    />
                    <input
                        id='opponentScore'
                        type='number'
                        placeholder='Opponent score'
                        onChange={handleScoreChange}
                        value={scoreData.opponentScore}
                        min='0'
                        max='99'
                        className='placeholderStyle'
                        style={{width: '100%'}}
                    />
                </div>
                <div>
                    <button onClick={handleScoreSubmission} style={{fontSize: '16px', height: '100%'}} id='submitScoreButton'>Submit Score</button>
                </div>
            </>
            )
        }
        
        /*
            If the game is waiting approval by both parties, show pending
            If the game has been approved and you have the scores submitted, allow the user to verify the game
            If the game has been approved and you don't have the scores, let the user input the game score
        */
        return (
            <>
              {currentCard.gameApprovalStatus && <PendingComponent />}
              {(!currentCard.gameApprovalStatus && (currentCard?.score?.playerScore || currentCard?.score?.opponentScore)) && <VerifyGameComponent />}
              {(!currentCard.gameApprovalStatus && !(currentCard?.score?.playerScore || currentCard?.score?.opponentScore)) && <ScoreInputComponent />}
            </>
        );               
      };
      

    const PendingGameComponent = () => {
        <>
        <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
            <div>Pending</div>

            <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'end', gap: '5px'}}>
                <div className='el'></div>
                <div className='el'></div>
                <div className='el'></div>
            </div>
        </div>
        
        </>
    }

    // If the game is confirmed, it will show pending, otherwise it will let you submit the scores
    const Card = ({ currentCard, type }) => (
        <li className='card' style={{padding: '20px'}}>
                <div style={{display: "flex", justifyContent:'space-between'}}>
                    <div>{currentCard.gameType}v{currentCard.gameType}</div>
                    <div>
                        <div>{currentCard.dateOfGame}</div>
                        <div>Time: {currentCard.time}</div>
                    </div>
                </div>
                <div style={{alignItems: 'center'}}>
                    <img src={missingImage} alt={'Profile img'}></img>
                </div>
                <div>
                    Opponent: {currentCard?.opponent}
                </div>
                <div>
                    {currentCard.addressString}
                </div>

                {type === 'confirmed' ? (
                    <ScoreSubmissionComponent currentCard={currentCard}/>
                ) : (
                    <PendingGameComponent />
                )}
        </li>
    );
    
    return (
        <section id="my-games" style={gridStyle}>
            <h1 style={h1Style}>My Games</h1>
            <div style={horizontalLine}></div>

            <div id='myGames-container' style={myGamesLocation}>
            <ul className="cards" >
                {myConfirmedGames.map((currentCard, i) => (
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type='confirmed'/>  
                ))}
                {myPendingGames.map((currentCard, i) => (
                    <Card key={`pending-${i}`} currentCard={currentCard} type='pending' />  
                ))}
            </ul>

            </div>
        </section>
    )
}

export { MyGames }