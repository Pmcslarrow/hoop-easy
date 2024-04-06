import { useEffect, useState } from 'react';
import setGridStyle from '../../utils/setGridStyle';
import { auth } from '../../config/firebase'
import axios from 'axios'
import { convertToLocalTime } from '../../utils/locationTimeFunctions';
import MapContainer from '../../components/ui/MapContainer';
import { v4 as uuidv4 } from 'uuid';

/* Material UI */
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/material/Divider'

/* Components */
import VerifyGameComponent from './VerifyGameComponent';
import ScoreInputComponent from './ScoreInputComponent';

const MyGames = ({ props }) => {
    const { setRefreshToken, refreshToken, setAnimateOverallRating } = props;
    const [confirmedGames, setMyGames] = useState([])
    const [currentUserID, setCurrentUserID] = useState([])

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


    const MyGamesCard = ({ currentCard, type, setAnimateOverallRating }) => {
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
        
        const convertedTime = convertToLocalTime(currentCard?.dateOfGameInUTC)
        const indexOfCountry = currentCard?.address?.lastIndexOf(',') ?? -1
        const address = indexOfCountry === -1 ? currentCard?.address?.slice(0, indexOfCountry) : currentCard.address

        return (
            <div class = "card-item">
                <Card
                    variant="outlined"
                    orientation="vertical"
                    sx={{
                        width: 350,
                        height: 400,
                        '&:hover': { boxShadow: 'lg', borderColor: 'neutral.outlinedHoverBorder' },
                    }} 
                >
                    <MapContainer
                        longitude={currentCard.longitude}
                        latitude={currentCard.latitude}
                    />
                    <CardContent style={{textAlign: 'left'}}>
                        <Typography level="body-xs" variant="plain">{currentCard.gameType}v{currentCard.gameType}</Typography>
                        <Typography level="title-sm" variant="plain">{address}</Typography>
                        <Typography level="body-sm" aria-describedby="card-description" mb={1} sx={{ color: 'text.tertiary' }}>
                            {convertedTime}
                        </Typography>
                    </CardContent>
                    <CardContent>
                        <Divider />
                        {renderLowerCardSection()}
                    </CardContent>  
                </Card>
            </div>
            
        )
    }

    const WaitingForGameAcceptance = () => {
        return (
            <Typography level="body-xs" variant="plain">Waiting for the game to be accepted by other players</Typography>
        );
    }
    const PendingGameApproval = () => {
        return ( 
            <Typography level="body-xs" variant="plain">Waiting for the score to be approved by your opponent</Typography>
        )        
    }

    const renderedGames = confirmedGames.map((currentCard, i) => (
        <MyGamesCard
          key={uuidv4()}
          currentCard={currentCard}
          type={currentCard.status}
          setAnimateOverallRating={setAnimateOverallRating}
        />
    ));

    return (
        <section id='my-games' style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
            <h1 style={{fontSize: '8vw', margin: '30px'}}>My Games</h1>
            <div className='wrapper'>
                {renderedGames.length === 0 ? "Go find games!" : renderedGames}
            </div>
        </section>
    )
}

export { MyGames }
