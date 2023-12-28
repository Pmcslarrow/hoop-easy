import React, { useEffect, useState, useCallback} from 'react';
import { auth, db } from '../../config/firebase';
import { getDocs, collection, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore'
import Teammates from './Teammates';
import missingImage from '../../images/missingImage.jpg'
import exitButton from '../../images/remove.png'
import '../styling/ScoreInput.css'
import ScoreDrawer from './Drawer'


const ScoreInputComponent = ({props}) => {
    const {currentCard, currentUser, refreshToken, setRefreshToken} = props

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