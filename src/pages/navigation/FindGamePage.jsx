import { Navbar } from '../../components/ui/Navbar'
import { useState, useEffect } from 'react'
import { getDistanceFromLatLonInMiles, convertToLocalTime } from '../../utils/locationTimeFunctions';
import getUserCoordinates from '../../utils/locationServices';
import { db } from '../../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { getDocs, collection } from 'firebase/firestore'
import { Card } from './Card'
import { FirebaseQuery } from '../../utils/FirebaseQuery'
import axios from 'axios';

import '../../assets/styling/FindGamePage.css'

function FindGamePage({ props }) {
    const { setAuthenticationStatus, currentUser, setCurrentUser, availableGames, setAvailableGames } = props
    const [ games, setGames ] = useState([])
    const [refreshToken, setRefreshToken] = useState(0)
    const [isLoading, setLoading] = useState(true);
    const query = new FirebaseQuery(null, currentUser)

    useEffect(() => {
        const fetchAvailableGames = async () => {
            setLoading(true);
    
            try {
                let games = await axios.get('http://localhost:5001/api/availableGames')
                games = games.data
                const sortedGames = await sortGamesByLocationDistance(games);
                setGames(sortedGames);
            } catch(err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        const sortGamesByLocationDistance = async (games) => {
            const userCoordinates = await getUserCoordinates();
            const { latitude: userLat, longitude: userLon } = userCoordinates;
            console.log("Trying to sort games by location distance...")
            const sortedGames = games.sort((game1, game2) => {
                const distance1 = getDistanceFromLatLonInMiles(userLat, userLon, game1.latitude, game1.longitude);
                const distance2 = getDistanceFromLatLonInMiles(userLat, userLon, game2.latitude, game2.longitude);
                return distance1 - distance2;
            });
            
            console.log(sortedGames)
            sortedGames.forEach((game) => {
                game.distance = getDistanceFromLatLonInMiles(userLat, userLon, game.latitude, game.longitude);
                game.time = convertToLocalTime(game.dateOfGameInUTC);
            });
            console.log(sortedGames)
        
    
            return sortedGames;
        };

        fetchAvailableGames();
    }, [refreshToken]);
    

    if (isLoading) {
        return (
            <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
                <l-bouncy-arc
                    size="100"
                    speed="0.7" 
                    color="orange" 
                ></l-bouncy-arc>
            </div>
        ) 
    }

    return (
        <section className="card-container">
            <Navbar />
            <div id='card-container'>
                {games && games.map((game) => (
                    <Card 
                        key={uuidv4()}
                        props={{
                            game, 
                            currentUser, 
                            refreshToken, 
                            setRefreshToken
                        }}
                    />
                ))}
            </div>

        </section>
    );
}
export default FindGamePage