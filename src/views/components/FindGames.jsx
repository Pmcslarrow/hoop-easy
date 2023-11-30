import React, { useState } from 'react';
import { getDocs, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import setGridStyle from '../setGridStyle';
import missingImage from '../../images/missingImage.jpg'

const FindGames = ( props ) => {
    const { db, currentUser, currentUserID, setRefreshToken, refreshToken, myConfirmedGamesRef, gamesCollectionRef, availableGames } = props 

    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const horizontalLine = setGridStyle(6, 4, 9, 6, "#da3c28", undefined, false);
    const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
    const carouselLocation = setGridStyle(6, 5, 11, 52, undefined, undefined, undefined)

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
        border: '2px solid green',
        borderRadius: '10px',
        margin: '0 auto'
    }
    const center = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }     
    // Carousel credit to: https://codepen.io/ykadosh/pen/ZEJLapj by Yoav Kadosh
    const Carousel = ({children}) => {
        const [active, setActive] = useState(0);
        const count = React.Children.count(children);
        
        return (
          <div className='carousel' style={{...carouselLocation, ...flexboxRow}}>
            {active > 0 && 
                <button className='nav left' onClick={() => setActive(i => i - 1)}>
                    Left
                </button>
            }
            {React.Children.map(children, (child, i) => (
              <div className='card-container' style={{
                  '--active': i === active ? 1 : 0,
                  '--offset': (active - i) / 3,
                  '--direction': Math.sign(active - i),
                  '--abs-offset': Math.abs(active - i) / 3,
                  // 'pointer-events': active === i ? 'auto' : 'none',
                  'opacity': Math.abs(active - i) >= 3 ? '0' : '1',
                  'display': Math.abs(active - i) > 3 ? 'none' : 'block',
                }}>
                {child}
              </div>
            ))}
            {active < count - 1 && 
                <button className='nav right' onClick={() => setActive(i => i + 1)}>
                    Right
                </button>
            }
          </div>
        );
    };

    const Card = ({ currentCard }) => (
        <div className='card'>
                <div style={{display: "flex", justifyContent:'space-between'}}>
                    <div>{currentCard.gameType}v{currentCard.gameType}</div>
                    <div>
                        <div>{currentCard.dateOfGame}</div>
                        <div>{currentCard.time}</div>
                    </div>
                </div>
                <div style={{alignItems: 'center'}}>
                    <img src={missingImage} alt={'Profile img'}></img>
                </div>
                <div style={{fontSize: '1.5em'}}>
                    {currentCard.username}
                </div>
                <div style={{display: "flex", justifyContent:'space-around'}}>
                    <div>{currentCard.heightFt}'{currentCard.heightInches}"</div>
                    <div>{currentCard.overall} ovr</div>
                </div>
                <div>
                    {currentCard.addressString}
                </div>
                <div 
                    className='cursor' 
                    style={{ ...buttonStyle, ...center }} 
                    onClick={() => handleGameAcceptance(currentCard)} 
                >
                accept
                </div>

        </div>
    );

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
            playerID: currentUserID
        }
        const dataForOpponent = {
            ...currentUser, // same
            addressString: opponentCard.addressString, // ibid
            coordinates: opponentCard.coordinates, // ibid
            date: opponentCard.date, // ibid
            dateOfGame: opponentCard.dateOfGame, // ibid
            time: opponentCard.time, // ibid
            opponent: currentUser.username, // Should your username
            opponentID: currentUserID, // Should show your ID
            playerID: opponentCard.id // Should show their ID
        }
    
        const matchingPendingDocs = pendingQuerySnapshot.docs.filter(doc => {
         const data = doc.data();
         return data.dateOfGame === opponentCard.dateOfGame && data.time === opponentCard.time;
        });

        const matchingAvailableGamesDocs = availableGamesQuerySnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.dateOfGame === opponentCard.dateOfGame && data.time === opponentCard.time;
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
            <div style={{ ...carouselLocation, ...flexboxRow }}>

                <Carousel>
                {availableGames.map((index, i) => (
                    <Card key={index} currentCard={availableGames[i]}/>
                ))}
                </Carousel>

            </div>
        </section>
    )
};     


export { FindGames }