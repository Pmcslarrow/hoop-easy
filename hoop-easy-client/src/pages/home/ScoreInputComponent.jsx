import React, { useEffect, useState, useCallback} from 'react';
import { db } from '../../config/firebase';
import ScoreDrawer from '../../components/form/Drawer'
import axios from 'axios'

import '../../assets/styling/ScoreInput.css'

const ScoreInputComponent = ({props}) => {
    const {currentCard, currentUserID, refreshToken, setRefreshToken} = props
    const [currentUser, setCurrentUser] = useState([])

    useEffect(() => {
        const getCurrentUser = async () => {
            const response = await axios.get(`https://hoop-easy-production.up.railway.app/api/getUserWithID?userID=${currentUserID}`)
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