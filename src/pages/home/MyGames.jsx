import React, { useEffect, useState, useCallback } from 'react';
import { getDocs, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import setGridStyle from '../../utils/setGridStyle';
import missingImage from '../../assets/images/missingImage.jpg'
import { FirebaseQuery } from '../../utils/FirebaseQuery'
import { auth } from '../../config/firebase'
import axios from 'axios'

/* Components */
import Teammates  from '../../components/ui/Teammates'
import VerifyGameComponent from './VerifyGameComponent';
import ScoreInputComponent from './ScoreInputComponent';

const MyGames = ({ props }) => {
    const { db, setRefreshToken, refreshToken } = props;
    const [confirmedGames, setMyGames] = useState([])
    const [currentUserID, setCurrentUserID] = useState([])

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

    function convertToLocalTime(storedUtcDateTime, options = {}) {
        try {
            const userLocalDateTime = new Date(storedUtcDateTime);
    
            if (isNaN(userLocalDateTime)) {
                throw new Error("Invalid date");
            }
    
            const userTimeZone = options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
            const dateFormat = options.dateFormat || { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const timeFormat = options.timeFormat || { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    
            const userDateTimeString = userLocalDateTime.toLocaleString('en-US', {
                timeZone: userTimeZone,
                ...dateFormat,
                ...timeFormat,
            });
    
            return userDateTimeString;
        } catch (error) {
            console.error("Error converting to local time:", error.message);
            return null;
        }
    }
    

    // Finds the verified games, confirmed games, and pending games from the passed in prop. (sorts in that order for rendering below)
    useEffect(() => {
        const getCurrentUserID = async () => {
            const currentUserEmail = auth?.currentUser?.email
            if (currentUserEmail !== undefined) {
                const result = await axios.get(`http://localhost:5001/api/getCurrentUserID?email=${currentUserEmail}`);
                setCurrentUserID(result.data)
                return result.data
            }
        }
        const getMyGames = async() => {
            const id = await getCurrentUserID()
            const games = await axios.get(`http://localhost:5001/api/myGames?userID=${id}`)
            setMyGames(games?.data)
        }

        getMyGames()
    }, [])


    const Card = ({ currentCard, type }) => {
        const renderLowerCardSection = () => {
            if (type === 'pending') {
                return <WaitingForGameAcceptance />
            }

            if (type === 'confirmed') {
                return <ScoreInputComponent props={{currentCard, currentUserID, refreshToken, setRefreshToken}} />
            }

            if (type === 'verification') {
                return handleVerificationStage()
            }
        };

        const handleVerificationStage = () => {
            const searchID = currentUserID.toString()
            const captainsArray = Object.values(currentCard.captains)
            const isCurrentUserCaptain = captainsArray.some((obj) => obj.toString() === searchID.toString())
            const isPendingApproval = checkIfUserIsPendingApproval(searchID)

            if (isCurrentUserCaptain && isPendingApproval) {
                return <VerifyGameComponent props={{currentCard, currentUserID, refreshToken, setRefreshToken}}/>
            } else {
                return <PendingGameApproval />
            }
        }

        const checkIfUserIsPendingApproval = (userID) => {
            const currentUserOnTeamOne = Object.values(currentCard.team1).some((obj) => obj.toString() === userID)

            if (currentUserOnTeamOne) {
                if (currentCard.teamOneApproval !== null) {
                    return false
                }
                return true
            } else {
                if (currentCard.teamTwoApproval !== null) {
                    return false
                }
                return true
            }
        }

        const convertedTime = convertToLocalTime(currentCard.dateOfGameInUTC, {
            timeZone: 'America/New_York',
            dateFormat: { year: 'numeric', month: 'numeric', day: 'numeric' },
            timeFormat: { hour: 'numeric', minute: 'numeric' },
        });
        
        const [dateOfGame, timeOfGame] = convertedTime.split(',');
        const trimmedDateOfGame = dateOfGame.trim();
        const trimmedTimeOfGame = timeOfGame.trim();
        
        return (
          <li className='card'>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...boldItalicStyle }}>
              <div>{currentCard.gameType}v{currentCard.gameType}</div>
              <div>
                <div>{trimmedDateOfGame}</div> {/* Date */}
                <div>{trimmedTimeOfGame}</div> {/* Time */}
              </div>
            </div>
            <div className='opponentText' style={{ padding: '20px'}}>
                {/*<Teammates game={currentCard}/>*/}
            </div>
            <div className='addressText'>{currentCard.addressString}</div>
            {renderLowerCardSection()}
          </li>
        );
    };

    const WaitingForGameAcceptance = () => {
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
    }

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


    return (
        <section id="my-games" style={gridStyle}>
            <h1 style={h1Style}>My Games</h1>
            <div style={horizontalLine}></div>

            <div id='myGamesContainer' style={myGamesLocation}>
            <ul className="cards" >

                {confirmedGames.map((currentCard, i) => (
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type={currentCard.status}/>  
                ))}
    
            </ul>

            </div>
        </section>
    )
}

export { MyGames }