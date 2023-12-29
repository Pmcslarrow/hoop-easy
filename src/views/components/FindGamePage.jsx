import { Navbar } from './Navbar'
import { useState, useEffect } from 'react'
import '../styling/FindGamePage.css'
import { getDistanceFromLatLonInMiles, convertToLocalTime } from '../functions/locationTimeFunctions';
import getUserCoordinates from '../functions/locationServices';
import { db } from '../../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { getDocs, collection } from 'firebase/firestore'
import { Card } from './Card'
import { FirebaseQuery } from '../functions/FirebaseQuery'

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
                const games = await query.getAvailableGamesWithCurrentUser()
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
    
            const sortedGames = games.sort((game1, game2) => {
                const distance1 = getDistanceFromLatLonInMiles(userLat, userLon, game1.coordinates._lat, game1.coordinates._long);
                const distance2 = getDistanceFromLatLonInMiles(userLat, userLon, game2.coordinates._lat, game2.coordinates._long);
                return distance1 - distance2;
            });
    
            sortedGames.forEach((game) => {
                game.distance = getDistanceFromLatLonInMiles(userLat, userLon, game.coordinates._lat, game.coordinates._long);
                game.time = convertToLocalTime(game.dateOfGame);
            });
    
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