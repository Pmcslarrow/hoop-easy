import React from 'react';
import { FirebaseQuery } from '../functions/FirebaseQuery'
import { useState, useEffect, useContext } from 'react'
import { db } from '../../config/firebase';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL 
} from "firebase/storage";
import { storage } from '../../config/firebase.js';
import missingProfilePic from '../../images/missingImage.jpg'



function Teammates({ game, currentUser }) {
    const [teammatePictureList, setTeammatePictureList] = useState([])

    useEffect(() => {
        const fetchUserProfilePics = async () => {            
            for (const userID of game.teammates) {
                const storageRef = ref(storage, `/files/${userID}/profilePic`);
                
                try {
                    const url = await getDownloadURL(storageRef);                    
                    setTeammatePictureList(prevList => [...prevList, url]);
                } catch (error) {
                    setTeammatePictureList(prevList => [...prevList, missingProfilePic]);
                    console.error("Error fetching image for userID:", userID, error);
                }
            }
        };
    
        fetchUserProfilePics();
    }, []); 

    function drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
        console.log("Dragging started for element with ID:", ev.target.id);
    }

    const playerPicSlot = teammatePictureList.map((url, i) => {
        return (
            <img 
                id={`drag-${i}`} 
                src={url} 
                alt='Profile pic' 
                draggable="true" 
                onDragStart={(event) => drag(event)} 
                style={{width: '50px', height: '50px', marginLeft: '3px', marginRight: '3px'}}
            />
        )
    })
    
    return playerPicSlot

}

export default Teammates