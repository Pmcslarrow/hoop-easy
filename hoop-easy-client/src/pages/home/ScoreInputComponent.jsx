import React, { useEffect, useState, useCallback} from 'react';
import { auth, db } from '../../config/firebase';
import { getDocs, collection, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore'
import missingImage from '../../assets/images/missingImage.jpg'
import exitButton from '../../assets/images/remove.png'
import ScoreDrawer from '../../components/form/Drawer'
import Teammates from '../../components/ui/Teammates';
import axios from 'axios'

import '../../assets/styling/ScoreInput.css'

const ScoreInputComponent = ({props}) => {
    const {currentCard, currentUserID, refreshToken, setRefreshToken} = props
    const [currentUser, setCurrentUser] = useState([])

    useEffect(() => {
        const getCurrentUser = async () => {
            const response = await axios.get(`http://localhost:5001/api/getUserWithID?userID=${currentUserID}`)
            const currentUser = response?.data
            setCurrentUser(currentUser)
        }
    
        getCurrentUser()
    }, [])

    return (        
    <>
        <div>
            <ScoreDrawer props={{
                currentCard,
                currentUser,
                refreshToken,
                setRefreshToken
                }}
            />
        </div>
    </>
    )
}


export default ScoreInputComponent