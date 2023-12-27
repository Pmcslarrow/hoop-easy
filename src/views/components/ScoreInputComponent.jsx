import React, { useEffect, useState, useCallback} from 'react';
import { auth, db } from '../../config/firebase';
import { getDocs, collection, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore'
import Teammates from './Teammates';
import missingImage from '../../images/missingImage.jpg'
import exitButton from '../../images/remove.png'
import '../styling/ScoreInput.css'

const ScoreInputComponent = ({props}) => {
    const {currentCard, currentUser, refreshToken, setRefreshToken} = props
    const [formState, setFormState] = useState(false)
    const [currentClickedGame, setCurrentClickedGame] = useState(null)

    /*
    HANDLING THE TYPING OF SCORES


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
        const playerDocRef = doc(db, `users/${currentUser.id}/confirmedGames`, playerDocID);
        const opponentConfirmed = collection(db, `users/${currentCard.opponentID}/confirmedGames`); // This is looking at a single opponentID which doesnt exit. Iterate through teammates
        const opponentConfirmedSnapshot = await getDocs(opponentConfirmed);

        console.log(currentCard)
        console.log(`users/${currentCard.opponentID}/confirmedGames`)

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
    */

    const toggleScoreForm = ( currentCard ) => {
        setFormState(!formState)
        setCurrentClickedGame(currentCard)
    }

    const Form = () => {
        const currentCard = currentClickedGame;

        function allowDrop(ev) {
            ev.preventDefault();
        }
        
        function drop(ev) {
            ev.preventDefault();
            var data = ev.dataTransfer.getData("text");
            ev.target.appendChild(document.getElementById(data));
        }

        return (
            <div id='scoreSubmissionForm'>
                <img id='exit' onClick={() => toggleScoreForm( currentCard ) } src={exitButton} alt='exit'/>
                <div className='flex-c'>
                    Drag players to the teams they played for
                    <div className='flex-r'>
                        <Teammates game={currentCard}/>
                    </div>
                </div>


                {/* Team drop boxes */}
                <div className='flex-r space'>
                    <div>
                        <h1>Team 1</h1>
                        <div id="drop-box" onDrop={(event) => drop(event)} onDragOver={(event) => allowDrop(event)}></div>
                    </div>
                    <div>
                        <h1>Team 2</h1>
                        <div id="drop-box2" onDrop={(event) => drop(event)} onDragOver={(event) => allowDrop(event)}></div>
                    </div>
                </div>
            </div>
        );
    };
    
    
    if ( formState === true ) {
        return <Form />
    }

    return (        
    <>
        <div>
            <button onClick={() => toggleScoreForm(currentCard)} id='submitScoreButton'>Submit Scores</button>
        </div>
    </>
    )
}


export default ScoreInputComponent