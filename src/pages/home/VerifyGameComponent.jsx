import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase';
import { getDocs, collection, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore'


const VerifyGameComponent = ({ props }) => {
    const { currentCard, currentUser, refreshToken, setRefreshToken } = props
    const boldItalicStyle = { fontFamily: 'var(--font-bold-italic)'}
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
    } /* ratingAlgorithm() */

    // How to call: const _ = await findConfirmedGameID(opponentConfirmedGamesRef, { coordinates, dateOfGame, time, opponentID });
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
    
            return null;
        } catch (error) {
            console.error("Error in findConfirmedGameID:", error);
            throw error; 
        }
    }       
    
    const deletingConfirmedGames = async ( opponentCard, currentUserConfirmedGamesRef, opponentConfirmedGamesRef, coordinates, dateOfGame, time, opponentID ) => {
        try {
            const confirmedGameID = await findConfirmedGameID(opponentConfirmedGamesRef, { coordinates, dateOfGame, time, opponentID });
        
            if (confirmedGameID) {
                const opponentConfirmedGameDocRef = doc(opponentConfirmedGamesRef, confirmedGameID);
                const currentUserConfirmedGameDocRef = doc(currentUserConfirmedGamesRef, opponentCard.id)

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
        
        Promise.all([
            updatingUserData(), 
            addingHistory(), 
            deletingConfirmedGames(opponentCard, currentUserConfirmedGamesRef, opponentConfirmedGamesRef, coordinates, dateOfGame, time, opponentID)])
        .then(() => {
            setRefreshToken(refreshToken + 1);
        })
        .catch((error) => {
            console.error("Error in one or more async functions:", error);
        });   

    } /* handleAccept() */

    const handleDeny = async () => {
        let opponentCard = currentCard
        const opponentDocRef = doc(db, `users/${opponentCard.playerID}`);
        const currentUserDocRef = doc(db, `users/${currentUser.id}`);
        const opponentConfirmedGamesRef = collection(db, `users/${opponentCard.opponentID}/confirmedGames`)
        const currentUserConfirmedGamesRef = collection(db,  `users/${currentUser.id}/confirmedGames`)

        const dataForOpponentCollection = {
            gamesDenied : String(parseInt(opponentCard.gamesDenied) + 1)
        }
        
        const dataForCurrentUserCollection = {
            gamesDenied : String(parseInt(currentCard.gamesDenied) + 1)
        }

        const {
            coordinates,
            dateOfGame,
            time,
            opponentID,
        } = opponentCard;


        const updatingUserData = async () => {
            try {
                await updateDoc(opponentDocRef, dataForOpponentCollection);
                await updateDoc(currentUserDocRef, dataForCurrentUserCollection);
                console.log("Data updated successfully");
            } catch (error) {
                console.error("Error updating user data:", error);
            }
        };

        Promise.all([
            updatingUserData(), 
            deletingConfirmedGames(opponentCard, currentUserConfirmedGamesRef, opponentConfirmedGamesRef, coordinates, dateOfGame, time, opponentID)
        ])
        .then(() => {
            setRefreshToken(refreshToken + 1);
        })
        .catch((error) => {
            console.error("Error in one or more async functions:", error);
        }); 
    } /* handleDeny() */

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
} /* VerifyGameComponent  */




export default VerifyGameComponent