import React, { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore'
import setGridStyle from '../setGridStyle';
import {XYPlot, LineSeries, XAxis, YAxis, HorizontalGridLines, VerticalGridLines} from 'react-vis';


const RatingsSection = ({ currentUser, currentUserID, db}) => {
    const [gameHistory, setGameHistory] = useState([])

    useEffect(() => {
        const fetchGameHistory = async () => {
            const historyCollectionPath = `users/${currentUserID}/history/`
            const historyRef = collection(db, historyCollectionPath)
     
            const historySnapshot = await getDocs(historyRef);
     
            const gameHistory = historySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}));
            setGameHistory(gameHistory)
        }
        fetchGameHistory()
     }, [])
     
     const data = gameHistory.map(game => ({
        x: new Date(game.dateOfGame),
        y: parseFloat(game.ratingAfterGame)
    }));
       
       
        
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(30, 1fr)',
        gap: '10px',
    };


    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);
    const paragraph = setGridStyle(5, 6, 10, 6, undefined, undefined, false);
    const graphGrid = setGridStyle(1, 8, 15, 30, undefined, undefined, false)


    return (
        <section id="history">
          <div id="history-container" style={gridStyle}>
            <h1 style={h1Style}>Your Ratings</h1>
            <div style={horizontalLine}></div>
            <p style={paragraph}>Courtside access to all your stats.</p>
            <div style={{ ...graphGrid, overflow: 'auto', backgroundColor: 'white' }}> 
            <XYPlot xType="time" width={600} height={300}>
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis title="Date of Game" />
            <YAxis title="Rating After Game" />
            <LineSeries data={data} />
            </XYPlot>


            </div>
          </div>
        </section>
      );          
}

export { RatingsSection }