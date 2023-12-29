import React, { useEffect, useState } from 'react';
import { getDocs, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import setGridStyle from '../functions/setGridStyle';
import missingImage from '../../assets/images/missingImage.jpg'
import leftArrow from '../../assets/images/left_arrow.png'
import rightArrow from '../../assets/images/right_arrow.png'
import getUserCoordinates from '../functions/locationServices';


const FindGames = ( props ) => {
    const { db, currentUser, currentUserID, setRefreshToken, refreshToken, myConfirmedGamesRef, gamesCollectionRef, availableGames } = props 
    const [sortedAvailableGames, setSortedAvailableGames] = useState([])
    const [carouselStyle, setStyle] = useState({}); 
    const [arrowStyle, setArrowStyle] = useState({})


    function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
        var dLon = deg2rad(lon2 - lon1); 
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        var dInMiles = d * 0.621371; // Convert to miles
        return dInMiles;
     }
     
     function deg2rad(deg) {
        return deg * (Math.PI/180)
     }

     function convertToLocalTime( storedUtcDateTime ) {
        const userLocalDateTime = new Date(storedUtcDateTime);
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userDateTimeString = userLocalDateTime.toLocaleString('en-US', { timeZone: userTimeZone });
        return userDateTimeString
    }

     
    useEffect(() => {
        const sortGamesByLocationDistance = async () => {
            const userCoordinates = await getUserCoordinates();
            const { latitude: userLat, longitude: userLon } = userCoordinates;
           
            const sortedGames = availableGames.sort((game1, game2) => {
              const distance1 = getDistanceFromLatLonInMiles(userLat, userLon, game1.coordinates._lat, game1.coordinates._long);
              const distance2 = getDistanceFromLatLonInMiles(userLat, userLon, game2.coordinates._lat, game2.coordinates._long);
              return distance1 - distance2;
            });
           
            const games = sortedGames.map((game) => {
              const distance = getDistanceFromLatLonInMiles(userLat, userLon, game.coordinates._lat, game.coordinates._long);
              return { ...game, distance };
            });
            
            games.forEach((game) => {
                game.time = convertToLocalTime(game.dateOfGame)
            })

            setSortedAvailableGames(games);
        }

        const handleResize = () => {
            if (window.innerWidth < 767) {
              setStyle({ ...mobileCarouselLocation });
              setArrowStyle({ left: '150px' })
            } else {
              setStyle({ ...carouselLocation });
              setArrowStyle({ left: '65px' })
            }
        };

        handleResize();
        sortGamesByLocationDistance()

        window.addEventListener('resize', handleResize);

        return () => {
        window.removeEventListener('resize', handleResize);
        };
    }, [])

    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const horizontalLine = setGridStyle(6, 4, 9, 6, "#da3c28", undefined, false);
    const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
    const carouselLocation = setGridStyle(6, 5, 11, 52, undefined, undefined, undefined)
    const mobileCarouselLocation = setGridStyle(3, 5, 11, 52, undefined, undefined, undefined)

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(60, 1fr)',
        gap: '10px',
    };
    const flexboxRow = {
        display: 'flex',
        flexDirection: 'space-around',
        alignItems: 'center',
        gap: '10px',
    }
    const buttonStyle = {
        height: '35px',
        width: '150px',
        border: '1px solid gray',
        backgroundColor: 'rgb(0, 95, 0)',
        borderRadius: '10px',
        margin: '0 auto'
    }
    const center = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }     
    const boldItalicStyle = { fontFamily: 'var(--font-bold-italic)'}

    // Carousel credit to: https://codepen.io/ykadosh/pen/ZEJLapj by Yoav Kadosh
    const Carousel = ({children}) => {
        const [active, setActive] = useState(0);
        const count = React.Children.count(children);
        
        return (
          <div className='carousel' style={{...carouselLocation, ...flexboxRow}}>
            {active > 0 && 
                <button className='nav left' onClick={() => setActive(i => i - 1)}>
                    <img className='arrows' id='left-arrow' src={leftArrow} alt='Left arrow' />
                </button>
            }
            {
            React.Children.map(children, (child, i) => (
                <div className='card-container' key={i} style={{
                    '--active': i === active ? 1 : 0,
                    '--offset': (active - i) / 3,
                    '--direction': Math.sign(active - i),
                    '--abs-offset': Math.abs(active - i) / 3,
                    'opacity': Math.abs(active - i) >= 3 ? '0' : '1',
                    'display': Math.abs(active - i) > 3 ? 'none' : 'block',
                }}>
                    {child}
                </div>
              ))              
            }
            {active < count - 1 && 
                <button className='nav right' onClick={() => setActive(i => i + 1)}>
                    <img className='arrows' id='right-arrow' src={rightArrow} alt='Right arrow' style={arrowStyle}/>
                </button>
            }
          </div>
        );
    };


    const Card = ({ currentCard }) => {
        const [dateOfGame, timeOfGame] = currentCard.time.split(',');
        const trimmedDateOfGame = dateOfGame.trim();
        const trimmedTimeOfGame = timeOfGame.trim();

        return (
        <div className='card'>
                <div style={{display: "flex", justifyContent:'space-between', ...boldItalicStyle}}>
                    <div>~{currentCard.distance.toFixed(2)} miles</div>
                    <div>
                        <div>{trimmedDateOfGame}</div>
                        <div>{trimmedTimeOfGame}</div>
                    </div>
                </div>
                <div style={{alignItems: 'center'}}>
                    <img src={missingImage} alt={'Profile img'} style={{ borderRadius: '5px', overflow: 'hidden', padding: '5px', background: `linear-gradient(135deg, rgba(250, 70, 47, 1) 0%, rgba(0, 0, 0, 0.55) 100%)` }} />
                </div>
                <div style={{fontSize: '2em', ...boldItalicStyle}}>
                    {currentCard.username}
                </div>
                <div style={{display: "flex", justifyContent:'space-around', ...boldItalicStyle,color: 'gray'}}>
                    <div>{currentCard.heightFt}'{currentCard.heightInches}"</div>
                    <div>{currentCard.overall} ovr</div>
                </div>
                <div style={{ ...boldItalicStyle, color: 'gray' }}>
                    {currentCard.addressString}
                </div>
                <div 
                    className='cursor' 
                    style={{ ...buttonStyle, ...center, ...boldItalicStyle }} 
                    onClick={() => handleGameAcceptance(currentCard)} 
                >
                ACCEPT GAME
                </div>
        </div>
    )};

    async function handleGameAcceptance ( opponentCard ) {
        const opponentID = opponentCard.playerID
        
        const myConfirmed = collection(db, myConfirmedGamesRef)
        const opponentPending = collection(db, `users/${opponentID}/pendingGames`)
        const opponentConfirmed = collection(db, `users/${opponentID}/confirmedGames`)
       
        const pendingQuerySnapshot = await getDocs(opponentPending);
        const availableGamesQuerySnapshot = await getDocs(gamesCollectionRef)

        const dataForCurrentPlayer = {
            ...opponentCard,
            opponent: opponentCard.username,
            opponentID: opponentCard.playerID,
            playerID: currentUserID,
            gameType: opponentCard.gameType
        }
        const dataForOpponent = {
            ...currentUser,
            addressString: opponentCard.addressString,
            coordinates: opponentCard.coordinates, 
            date: opponentCard.date, 
            dateOfGame: opponentCard.dateOfGame, 
            time: opponentCard.time, 
            opponent: currentUser.username, 
            opponentID: currentUserID, 
            playerID: opponentCard.id, 
            gameType: opponentCard.gameType
        }
    
        // These next few variables take the clicked card and compare it to the cards that exist in the opponent's pendingGames and the Games collection
        // We then go through and remove the instance (doc.ref) of the opponent's pendingGame and the Game that is available from the collections
        const matchingPendingDocs = pendingQuerySnapshot.docs.filter(doc => {
            const data = doc.data();
            console.log(data, opponentCard)
            return data.dateOfGame === opponentCard.dateOfGame;
        });

        const matchingAvailableGamesDocs = availableGamesQuerySnapshot.docs.filter(doc => {
            const data = doc.data();
            console.log(data, opponentCard)
            return data.dateOfGame === opponentCard.dateOfGame;
        });

        matchingPendingDocs.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        
        matchingAvailableGamesDocs.forEach(async (doc) => {
            await deleteDoc(doc.ref)
        })

        await addDoc(myConfirmed, dataForCurrentPlayer);
        await addDoc(opponentConfirmed, dataForOpponent);
       
        setRefreshToken(refreshToken + 1)
    }

    return (
        <section id="find-game" style={gridStyle}>
            <h1 style={h1Style}>Find a game</h1>
            <div style={horizontalLine}></div>
            <p style={paragraph}></p>
            <div style={{ ...carouselStyle, ...flexboxRow }}>

                <Carousel>
                {sortedAvailableGames.map((index, i) => (
                    <Card key={index} currentCard={sortedAvailableGames[i]}/>
                ))}
                </Carousel>

            </div>
        </section>
    )
};     


export { FindGames }