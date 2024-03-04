import React, { useEffect, useState } from 'react';
import setGridStyle from '../../utils/setGridStyle';
import { auth } from '../../config/firebase'
import axios from 'axios'
import { convertToLocalTime } from '../../utils/locationTimeFunctions';

/* Components */
import VerifyGameComponent from './VerifyGameComponent';
import ScoreInputComponent from './ScoreInputComponent';

const MyGames = ({ props }) => {
    const { setRefreshToken, refreshToken, setAnimateOverallRating } = props;
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
    

    useEffect(() => {
        const getCurrentUserID = async () => {
            const currentUserEmail = auth?.currentUser?.email
            if (currentUserEmail !== undefined) {
                const result = await axios.get(`https://hoop-easy-production.up.railway.app/api/getCurrentUserID?email=${currentUserEmail}`);
                setCurrentUserID(result.data)
                return result.data
            }
        }
        const getMyGames = async() => {
            const id = await getCurrentUserID()
            const games = await axios.get(`https://hoop-easy-production.up.railway.app/api/myGames?userID=${id}`)
            setMyGames(games?.data)
        }

        getMyGames()
    }, [])


    const Card = ({ currentCard, type, setAnimateOverallRating }) => {
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
            const captainsArray = Object.values(currentCard?.captains)
            const isCurrentUserCaptain = captainsArray.some((obj) => obj.toString() === searchID.toString())
            const isPendingApproval = checkIfUserIsPendingApproval(searchID)

            if (isCurrentUserCaptain && isPendingApproval) {
                return <VerifyGameComponent props={{currentCard, currentUserID, refreshToken, setRefreshToken, setAnimateOverallRating}}/>
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

        const convertedTime = convertToLocalTime(currentCard.dateOfGameInUTC)
        
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
                    <Card key={`confirmed-${i}`} currentCard={currentCard} type={currentCard.status} setAnimateOverallRating={setAnimateOverallRating}/>  
                ))}
    
            </ul>

            </div>
        </section>
    )
}

export { MyGames }
