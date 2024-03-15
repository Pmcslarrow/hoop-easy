import * as React from 'react';
import setGridStyle from '../../utils/setGridStyle';
import { auth } from '../../config/firebase'
import axios from 'axios'
import { convertToLocalTime } from '../../utils/locationTimeFunctions';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import MapContainer from '../../components/ui/MapContainer';

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
    const [confirmedGames, setMyGames] = React.useState([])
    const [currentUserID, setCurrentUserID] = React.useState([])
    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const myGamesLocation = setGridStyle(2, 6, 12, 30, undefined, undefined, undefined)
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(30, 1fr)',
        gap: '10px',
    };
    

    React.useEffect(() => {
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
        const indexOfCountry = currentCard.address.lastIndexOf(',')
        const address = currentCard.address.slice(0, indexOfCountry)
        return (
            <Card
                variant="outlined"
                orientation="vertical"
                sx={{
                    width: 320,
                    height: 350,
                    '&:hover': { boxShadow: 'lg', borderColor: 'neutral.outlinedHoverBorder' },
                }}
            >
                <MapContainer
                    longitude={parseFloat(currentCard.longitude)}
                    latitude={parseFloat(currentCard.latitude)}
                />
                {/*
                <Map 
                    zoom={12} 
                    center={{lat: parseFloat(currentCard.latitude), lng: parseFloat(currentCard.longitude)}} 
                    disableDefaultUI={true} 
                    style={{ width: '95%', height: '50%', position: 'relative', borderRadius: '10px', margin: '2.5%'}}>
                </Map>
                */}   
                <CardContent style={{textAlign: 'left', marginLeft: '5%', marginRight: '5%'}}>
                    <Typography level="body-xs" variant="plain">1v1</Typography>
                    <Typography level="title-sm" variant="plain">{address}</Typography>
                    <Typography level="body-sm" aria-describedby="card-description" mb={1} sx={{ color: 'text.tertiary' }}>
                        {convertedTime}
                    </Typography>
                    <Divider />
                    {renderLowerCardSection()}
                </CardContent>
            </Card>
        )
    };

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
          key={`confirmed-${i}`}
          currentCard={currentCard}
          type={currentCard.status}
          setAnimateOverallRating={setAnimateOverallRating}
        />
    ));

    return (
        <section id="my-games" style={gridStyle}>
            <h1 style={h1Style}>My Games</h1>
            <div style={myGamesLocation}>
                <ul className="cards">{renderedGames}</ul>
            </div>
        </section>
    )
}

export { MyGames }
