// PlayerOverallRating.jsx
import React from 'react';
import { useState, useEffect } from 'react'
import { auth } from '../../config/firebase.js';
import missingImage from '../../assets/images/missingImage.jpg'
import { convertToLocalTime } from '../../utils/locationTimeFunctions.js';
import axios from 'axios'
import MapContainer from '../../components/ui/MapContainer.jsx';

/* Material UI */
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/material/Divider'
import { Button } from '@mui/material';

const FindGameCard = ({ props }) => {
    const { game, refreshToken, setRefreshToken } = props;
    const [teammatesIdArray, setTeammatesIdArray] = useState([]);
    const MAX_PLAYERS = parseInt(game.gameType) * 2
    const CURRENT_NUMBER_TEAMMATES = teammatesIdArray && teammatesIdArray.length > 0 ? teammatesIdArray.length : 0;
    const [currentUserID, setCurrentUserID] = useState([])

    useEffect(() => {
        const getArrayOfTeammates = async () => {
            try {
                const result = await axios.get('https://hoop-easy-production.up.railway.app/api/getTeammates', { params: game });        
                if (result.data && result.data[0] && result.data[0].teammates) {
                    const teammates = result.data[0].teammates;
                    const teammatesArray = Object.keys(teammates).map(key => teammates[key]);
                    setTeammatesIdArray(teammatesArray);
                } else {
                    console.error('Unexpected response structure:', result.data);
                }
            } catch (error) {
                console.error('Error fetching teammates:', error);
            }
        };
        
        
        const getCurrentUserID = async () => {
            const currentUserEmail = auth?.currentUser?.email
            if (currentUserEmail !== undefined) {
                const result = await axios.get(`https://hoop-easy-production.up.railway.app/api/getCurrentUserID?email=${currentUserEmail}`);
                setCurrentUserID(result.data)
            }
        }
                
        getArrayOfTeammates()
        getCurrentUserID()
    }, [refreshToken]);
    

    const handleJoinGame = async () => {
        try {

            let newSizeOfTeammates = teammatesIdArray.length += 1;
            teammatesIdArray.push(currentUserID)
            const newTeammatesIdArray = teammatesIdArray
            const newJSONTeammates = createTeammateJsonFromArray(newTeammatesIdArray)
            await axios.put(`https://hoop-easy-production.up.railway.app/api/updateTeammates?gameID=${game.gameID}&teammateJson=${newJSONTeammates}`)
            
            if (isFull(newSizeOfTeammates)){
                await axios.put(`https://hoop-easy-production.up.railway.app/api/updateStatus?gameID=${game.gameID}&status=confirmed`)
            }
            setRefreshToken(refreshToken + 1)
            return
        } catch (err) {
            console.log("Error trying to join game: ", err)
        }
    }
    

    const handleLeaveGame = async () => {
        const sizeOfArrayAfterRemoval = teammatesIdArray.length - 1
        const newTeammatesIdArray = teammatesIdArray.filter(id => id.toString() !== currentUserID.toString());
        
        if (isEmpty(sizeOfArrayAfterRemoval)) {
            await axios.delete(`https://hoop-easy-production.up.railway.app/api/deleteGame?gameID=${game.gameID}`)
            setRefreshToken(refreshToken + 1)
            return
        }

        const newJSONTeammates = createTeammateJsonFromArray(newTeammatesIdArray)
        await axios.put(`https://hoop-easy-production.up.railway.app/api/updateTeammates?gameID=${game.gameID}&teammateJson=${newJSONTeammates}`);
        setRefreshToken(refreshToken + 1)
        return
    }


    const isEmpty = (size) => {
        return size <= 0
    }

    const isFull = (size) => {
        return size === MAX_PLAYERS
    }

    // @input: ['2', '3']
    // @return: '{"teammate0": "1", "teammate1": "2"}'
    const createTeammateJsonFromArray = (array) => {
        const jsonArray = []
        for (let i=0; i<array.length; i++) {
            if (array[i] !== undefined) {
                const string = `"teammate${i}": "${array[i]}"`
                jsonArray.push(string)
            }
        }
        const jsonInside = jsonArray.join(', ')
        const json = '{' + jsonInside + '}'
        return json
    }
  
    const playerSlots = Array.from({ length: MAX_PLAYERS }, (_, index) => {
        const className = index < CURRENT_NUMBER_TEAMMATES ? 'taken' : 'open';        
        return <div key={index} className={className}></div>;
    });

    // We disable the player's ability to join a game if they are already a teammate of the game -- So they can leave the game instead
    const disablePlayerAbilityToJoinGame = teammatesIdArray ? teammatesIdArray.some((player) => player.toString() === currentUserID.toString()) : false;
    
    if ( CURRENT_NUMBER_TEAMMATES <= 0 ) {
        return <div style={{display: 'none'}}></div>
    }
    
    // Expecting 2024-01-28 01:40:00 which is 5:40pm in my time
    const convertedDateTime = convertToLocalTime(game.dateOfGameInUTC)
    const {latitude, longitude} = game

    // Removes the country so that it fits well in the card
    const indexOfCountry = game.address.lastIndexOf(',')
    const address = game.address.slice(0, indexOfCountry)

    const buttonStyling = {
        backgroundColor: 'var(--background-gradient-start)',
        color: 'white',
        '&:hover': {
            backgroundColor: 'var(--background-dark-orange)'
        }
    }

    return (
        <Card
            variant="outlined"
            orientation="vertical"
            sx={{
                width: '90%',
                height: 350,
                '&:hover': { boxShadow: 'lg', borderColor: 'neutral.outlinedHoverBorder' },
            }}
        >
            <MapContainer
                longitude={parseFloat(longitude)}
                latitude={parseFloat(latitude)}
            />
            <CardContent style={{textAlign: 'left'}}>
                <Typography level="body-xs" variant="plain">{game.gameType}v{game.gameType}</Typography>
                <Typography level="title-sm" variant="plain">{address}</Typography>
                <Typography level="body-sm" aria-describedby="card-description" mb={1} sx={{ color: 'text.tertiary' }}>
                    {convertedDateTime}
                </Typography>
            </CardContent>
                <Divider />
            <CardContent orientation="horizontal" style={{gap: '5px', justifyContent: 'space-between'}}>
                <CardContent orientation="vertical" style={{gap: '5px'}}>
                    <Typography level="body-sm" variant="plain">Player Slots</Typography>
                    <CardContent orientation='horizontal' style={{gap: '5px'}}>
                        {playerSlots}
                    </CardContent>
                </CardContent>
                <Button 
                    onClick={disablePlayerAbilityToJoinGame? handleLeaveGame : handleJoinGame}  
                    sx={buttonStyling}
                    size='small'
                >
                    {disablePlayerAbilityToJoinGame ? 'LEAVE GAME' : 'JOIN GAME'}
                </Button>
            </CardContent>  
        </Card>
    )
};

export { FindGameCard };
