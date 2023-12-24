import { Navbar } from './Navbar'
import { useState, useEffect } from 'react'
import '../styling/FindGamePage.css'
import { getDistanceFromLatLonInMiles, convertToLocalTime } from '../functions/locationTimeFunctions';
import getUserCoordinates from '../functions/locationServices';
import { auth, db } from '../../config/firebase';
import { FirebaseQuery } from '../functions/FirebaseQuery'
import { v4 as uuidv4 } from 'uuid';
import { getDocs, collection } from 'firebase/firestore'




const Card = ({ game, currentUser, refreshToken, setRefreshToken }) => {
    const query = new FirebaseQuery(db, game, currentUser);
    const [opacity, setOpacity] = useState(0)
    const [teammatesIdArray, setTeammatesIdArray] = useState([]);

    /* Global Variables */
    const MAX_PLAYERS = parseInt(game.gameType) * 2
    const CURRENT_NUMBER_TEAMMATES = teammatesIdArray && teammatesIdArray.length > 0 ? teammatesIdArray.length : 0;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teammates = await query.getTeammateIdArray()
                setTeammatesIdArray(teammates);
            } catch (error) {
                console.log(error);
            }
        };
    
        fetchData();
    }, [refreshToken]);


    const handleJoinGame = async () => {
        try {
            await query.joinGame();            
            console.log([...query.teammatesIdArray])        
            setTeammatesIdArray([...query.teammatesIdArray]);            
            
            if (query.teammatesIdArray.length >= MAX_PLAYERS) {  await query.handleFullGame();  }
        
            setRefreshToken(prevToken => prevToken + 1);
        } catch (error) {
            console.log("Error handling join game:", error);
        }
    }
    
    const handleLeaveGame = async () => {
        try {
            await query.leaveGame();
            console.log([...query.teammatesIdArray]);
            setTeammatesIdArray([...query.teammatesIdArray]);

            if (query.teammatesIdArray.length <= 0) {  await query.handleEmptyGame();  }

            setRefreshToken(prevToken => prevToken + 1);
        } catch (error) {
            console.log("Error handling leave game:", error);
        }
    }
    
  
    const hover = () => {
        if ( opacity === 0 ) {
            setOpacity(1)
        } else {
            setOpacity(0)
        }
    }

    const playerSlots = Array.from({ length: MAX_PLAYERS }, (_, index) => {
        const className = index < CURRENT_NUMBER_TEAMMATES ? 'taken' : 'open';        
        return <div key={index} className={className}></div>;
    });
    const disablePlayerAbilityToJoinGame = teammatesIdArray ? teammatesIdArray.some((player) => player === currentUser.id) : false;

    
    if ( CURRENT_NUMBER_TEAMMATES <= 0 ) {
        return <div>No games to join! Return to the homepage to create some of your own!</div>
    }
    
    return (
        <div>
            <div id='card-outer' onMouseEnter={hover} onMouseLeave={hover} onClick={disablePlayerAbilityToJoinGame? handleLeaveGame : handleJoinGame}>
                <div>
                    <span className="card-text" style={{opacity: opacity === 0 ? 1 : 0}}></span>
                    <span className='accept-text' style={{opacity: opacity === 0 ? 0 : 1}}>
                        {disablePlayerAbilityToJoinGame ? 'LEAVE' : 'JOIN'}
                        <div className='slots'>
                            {playerSlots}
                        </div>
                    </span>
                </div>
            </div>
            <div id='subtext'>
                <div id='subtext-left'>
                    <h4>{game.username}</h4>
                    <p>{game.addressString}</p>
                    <p>{game.time}</p>
                </div>
                <div id='subtext-right'>
                    <p>{game.overall} Overall</p>
                    <p>{game.distance.toFixed(2)} Miles</p>
                    <p>{game.gameType}v{game.gameType}</p>
                </div>
            </div>
        </div>
    );
};

function FindGamePage(props) {
    const { currentUser } = props
    const [ games, setGames ] = useState([])

    // Loading
    const [refreshToken, setRefreshToken] = useState(0)
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
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
        const fetchAvailableGames = async () => {
            setLoading(true);
    
            try {
                const gamesCollectionRef = collection(db, 'Games');
                const snapshot = await getDocs(gamesCollectionRef);
                const fetchedGames = snapshot.docs.map((doc) => ({...doc.data(), id: doc.id, gamesID: doc.id}));
                
                const sortedGames = await sortGamesByLocationDistance(fetchedGames);
                console.log("RERENDER: ", sortedGames)
                setGames(sortedGames);
            } catch(err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
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
                        game={game}
                        currentUser={currentUser}
                        refreshToken={refreshToken}
                        setRefreshToken={setRefreshToken}
                    />
                ))}
            </div>

        </section>
    );
}
export default FindGamePage