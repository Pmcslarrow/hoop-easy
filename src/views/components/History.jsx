import React, { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore'
import setGridStyle from '../functions/setGridStyle';

const History = ( { currentUser, currentUserID, db}) => {
    const [data, setData] = useState([])


    function convertToLocalTime( storedUtcDateTime ) {
        const userLocalDateTime = new Date(storedUtcDateTime);
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userDateTimeString = userLocalDateTime.toLocaleString('en-US', { timeZone: userTimeZone });
        return userDateTimeString
    }

    useEffect(() => {
        const fetchGameHistory = async () => {
            const historyCollectionPath = `users/${currentUserID}/history/`
            const historyRef = collection(db, historyCollectionPath)
            const historySnapshot = await getDocs(historyRef);
            const gameHistory = historySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}));

            const data = gameHistory.map(obj => ({
                when: convertToLocalTime(obj.time),
                who: obj.opponent,
                where: obj.addressString,
                what: `You: ${obj.yourScore} Opp: ${obj.opponentScore}`,
                ratingDifference: (parseFloat(obj.ratingAfterGame) - parseFloat(obj.ratingBeforeGame)).toFixed(2)
            }));

            data.sort((a, b) => new Date(b.when) - new Date(a.when));

            setData(data)
        }
        fetchGameHistory()
     }, [])
     
        
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(30, 1fr)',
        gap: '10px',
    };
    const tableHeaderStyle = {
        textAlign: 'center',
        fontSize: '25px'
    };
    const tableCellStyle = {
        border: '1px solid rgba(255, 255, 255, 0.5)',
        padding: '5px'
    };

    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);
    const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
    const tableGrid = setGridStyle(1, 10, 15, 30, undefined, undefined, false)

    return (
        <section id="history">
          <div id="history-container" style={gridStyle}>
            <h1 style={h1Style}>Your history</h1>
            <div style={horizontalLine}></div>
            <p style={paragraph}>See how previous games stack up.</p>

            <div style={{ ...tableGrid, overflow: 'auto' }}> 
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead style={tableHeaderStyle}>
                  <tr>
                    <th style={{ ...tableCellStyle, height: '50px' }}>When</th>
                    <th style={ tableCellStyle } className='hide'>Who</th>
                    <th style={ tableCellStyle } className='hide'>Where</th>
                    <th style={ tableCellStyle }>What</th> 
                    <th style={ tableCellStyle } className='hide'>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => ( 
                    <tr key={index} style={{ border: '1px solid white' }}>
                        <td style={index === 0 ? { ...tableCellStyle, borderTop: '1px solid white' } : tableCellStyle}>
                         {row.when}
                        </td>
                        <td style={{ ...tableCellStyle, height: '50px' }} className='hide'>{row.who}</td>
                        <td style={tableCellStyle} className='hide'>{row.where}</td>
                        <td style={tableCellStyle}>{row.what}</td>
                        <td style={{...tableCellStyle, color: row.ratingDifference > 0.0 ? 'green' : 'red', fontSize: '20px'}} className='hide'>
                            {row.ratingDifference > 0.0 ? `+${row.ratingDifference}` : `-${Math.abs(row.ratingDifference)}`}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );          
}

export { History }