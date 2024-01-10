import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase';
import { getDocs, collection, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore'
import { convertToMySQLDatetime } from '../../utils/toJSON';
import axios, { all } from 'axios'


const VerifyGameComponent = ({ props }) => {
    const { currentCard, currentUserID, refreshToken, setRefreshToken } = props
    const [currentUser, setCurrentUser] = useState([])
    const boldItalicStyle = { fontFamily: 'var(--font-bold-italic)'}
    const isCurrentUserOnTeamOne = Object.values(currentCard.team1).some((obj) => obj.toString() === currentUserID.toString())
    const teamOneObject = {
        team1: currentCard.team1,
        score: currentCard.scores.team1
    }
    const teamTwoObject = {
        team2: currentCard.team2,
        score: currentCard.scores.team2
    }
    const flexRow = {
        display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '5px'
    }

    useEffect(() => {
        const getCurrentUser = async () => {
            const response = await axios.get(`http://localhost:5001/api/getUserWithID?userID=${currentUserID}`)
            const currentUser = response?.data
            setCurrentUser(currentUser)
        }
    
        getCurrentUser()
    }, [])


    /*
     * Calculates the rating algorithm based on the given teams and scores.
     *
     * @param {Array} team_A - An array representing the userIDs of team A
     * @param {Array} team_B - An array representing the userIDs of team B
     * @param {number} score_A - The score for Team A.
     * @param {number} score_B - The score for Team B.
     * @returns {Promise<number>} - Returns a Promise that resolves to the calculated average overall rating change per team. 
     * 
     * An example exists below at the return statement
    */
    async function ratingAlgorithm( team_A, team_B, score_A, score_B ) {
        console.log(team_A, team_B)
        const team_A_values = Object.values(team_A).join(',');
        const team_B_values = Object.values(team_B).join(',');

        const team_A_JSON = await axios.get('http://localhost:5001/api/teamData', {
            params: {
              values: team_A_values
            }
        })

        const team_B_JSON = await axios.get('http://localhost:5001/api/teamData', {
            params: {
              values: team_B_values
            }
        })

        const team_A_array = team_A_JSON.data;
        const team_B_array = team_B_JSON.data;
        
        const team_A_overalls = team_A_array.map((obj) => parseFloat(obj.overall));
        const team_B_overalls = team_B_array.map((obj) => parseFloat(obj.overall));
        
        const team_A_games_played = team_A_array.map((obj) => parseInt(obj.gamesPlayed) + 1);
        const team_B_games_played = team_B_array.map((obj) => parseInt(obj.gamesPlayed) + 1);
        
        const team_A_average_overall = team_A_overalls.reduce((a, b) => a + b) / team_A_overalls.length;
        const team_B_average_overall = team_B_overalls.reduce((a, b) => a + b) / team_B_overalls.length;
        
        const team_A_average_games_played = team_A_games_played.reduce((a, b) => a + b) / team_A_games_played.length;
        const team_B_average_games_played = team_B_games_played.reduce((a, b) => a + b) / team_B_games_played.length;
        

        let R_A, R_B, Q_A, Q_B, E_A, E_B, S_A, S_B, new_R_A, new_R_B, player_A, player_B
        const c = 400

        R_A = team_A_average_overall
        R_B = team_B_average_overall

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
        let team_A_games = team_A_average_games_played
        let team_B_games = team_B_average_games_played
        let k_A = calculate_k_scale(team_A_games)
        let k_B = calculate_k_scale(team_B_games)
        let l_A = calculate_l_scale(team_A_games)
        let l_B = calculate_l_scale(team_B_games)

        new_R_A = R_A + k_A*(S_A-E_A) + l_A*(score_A/(score_A + score_B)) 
        new_R_B = R_B + k_B*(S_B-E_B) + l_B*(score_B/(score_A + score_B))
        
        new_R_A = Number.parseFloat(new_R_A).toFixed(2)
        new_R_B = Number.parseFloat(new_R_B).toFixed(2)

        const team_A_average_overall_delta = (new_R_A - team_A_average_overall).toFixed(2)
        const team_B_average_overall_delta = (new_R_B - team_B_average_overall).toFixed(2)

        /*
        Example:

        If team A has an average overall rating of 60 overall and they lost 5 to 21.
        The algorithm would find that the new overall rating for the team A would be 58.2.
        This means that the average change (delta) would be around -1.8 for team A! 

        We can use this information to generalize the overall score change based on this
        delta for everyone on team A.

        If player_x had an overall rating of 70 and was on team A --> their overall score is now 68.2 :)
        */

        console.log("Should be changing by: ", team_A_average_overall_delta, team_B_average_overall_delta)
        return { team_A_average_overall_delta, team_B_average_overall_delta }
    } /* ratingAlgorithm() */

    /*
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

    } 

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
    } 
    */

    const handleAccept = async () => {
        if (currentCard.teamOneApproval || currentCard.teamTwoApproval) {
            const ratingChanges = await ratingAlgorithm(teamOneObject.team1, teamTwoObject.team2, teamOneObject.score, teamTwoObject.score)
            const { team_A_average_overall_delta, team_B_average_overall_delta } = ratingChanges
            const convertedDT = convertToMySQLDatetime(currentCard.dateOfGameInUTC)

            await updateTeamOverallRatings(teamOneObject.team1, team_A_average_overall_delta)
            await updateTeamOverallRatings(teamTwoObject.team2, team_B_average_overall_delta)

            await updateTeamHistory(
                teamOneObject.team1,  // "Team A"
                convertedDT,  // "2024-01-17 18:07:00"
                teamTwoObject.team2,  // "Team B"
                currentCard.address,  // "2065 Myrtle Ave NE"
                [teamOneObject.score, teamTwoObject.score],  // [21, 5]
                team_A_average_overall_delta  // -1.67
            );            

            await updateTeamHistory(
                teamTwoObject.team2,
                convertedDT,
                teamOneObject.team1,
                currentCard.address,
                [teamTwoObject.score, teamOneObject.score],
                team_B_average_overall_delta
            )

            await removeGameInstance(currentCard.gameID)

        } else {                
            if (isCurrentUserOnTeamOne) {
                await axios.put(`http://localhost:5001/api/approveScore?team=1&gameID=${currentCard.gameID}`);
            } else {
                await axios.put(`http://localhost:5001/api/approveScore?team=2&gameID=${currentCard.gameID}`);
            }
        }
        setRefreshToken(refreshToken + 1)
    }

    const handleDeny = async () => {
        await updateDeniedGames()
        await removeGameInstance(currentCard.gameID)
        setRefreshToken(refreshToken + 1)
    }

    const updateTeamOverallRatings = async (team, delta) => {
        await axios.put(`http://localhost:5001/api/updateTeamOverallRatings?overallChange=${delta}`, {
            params : {
                values: Object.values(team).join(',')
            }
        })
    }

    const updateTeamHistory = async (team, when, who, where, what, rating) => {
        const currentTeam = Array(Object.values(team).join(','))
        const data = {
            team: currentTeam,
            when,
            who,
            where,
            what,
            rating,
        }
        await axios.post('http://localhost:5001/api/createHistoryInstance', {
            params: {
                values: data
            }
        })
    }

    const removeGameInstance = async(gameID) => {
        await axios.delete(`http://localhost:5001/api/deleteGame?gameID=${gameID}`)
    }
    

    const updateDeniedGames = async () => {
        const allPlayersInGame = Object.values(currentCard.teammates)
        await axios.put(`http://localhost:5001/api/updateDeniedGames`, {
            params: {
                values: allPlayersInGame
            }
        })
    }

    const center = { position: 'relative', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', ...boldItalicStyle}
    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '10px'}}>
            <div style={flexRow}>
                <div style={{...flexRow, ...boldItalicStyle, color: 'gray'}}>
                    <div>You</div>
                </div>
                <div style={{...flexRow, ...boldItalicStyle, fontSize: '36px'}}>
                    <div>
                        {isCurrentUserOnTeamOne ? teamOneObject.score : teamTwoObject.score}
                    </div>
                    :
                    <div>
                        {isCurrentUserOnTeamOne ? teamTwoObject.score : teamOneObject.score}
                    </div>
                </div>
                <div style={{...flexRow, ...boldItalicStyle, color: 'gray'}}>
                    <div>Opp</div>
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