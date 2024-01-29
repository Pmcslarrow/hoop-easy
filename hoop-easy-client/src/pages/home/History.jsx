import React, { useEffect, useState } from 'react';
import setGridStyle from '../../utils/setGridStyle';
import axios from 'axios'
import { convertToLocalTime } from '../../utils/locationTimeFunctions';

const History = ( { currentUserID }) => {
    const [gameHistory, setGameHistory] = useState([])

    useEffect(() => {
        const fetchGameHistory = async () => {            
            const response = await axios.get(`https://hoop-easy-production.up.railway.app/api/getHistory?userID=${currentUserID}`)
            let data = response.data
            const updatedData = data.map((obj) => {
                obj.game_date = convertToLocalTime(obj.game_date);
                return obj;
            });
            updatedData.sort((a, b) => new Date(b.game_date) - new Date(a.game_date));
            setGameHistory(updatedData)
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
                    {/*<th style={ tableCellStyle } className='hide'>Who</th>*/}
                    <th style={ tableCellStyle } className='hide'>Where</th>
                    <th style={ tableCellStyle }>What</th> 
                    <th style={ tableCellStyle } className='hide'>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory.map((row, index) => ( 
                    <tr key={index} style={{ border: '1px solid white' }}>
                        <td style={index === 0 ? { ...tableCellStyle, borderTop: '1px solid white' } : tableCellStyle}>
                         {row.game_date}
                        </td>
                        {/*<td style={{ ...tableCellStyle, height: '50px' }} className='hide'>{row.who}</td> */} 
                        <td style={tableCellStyle} className='hide'>{row.game_location}</td>
                        <td style={tableCellStyle}>{`YOU ${row.my_team_score} : ${row.opponent_team_score} OPP`}</td>
                        <td style={{...tableCellStyle, color: parseFloat(row.rating) > 0.0 ? 'green' : 'red', fontSize: '20px'}} className='hide'>
                            {row.rating > 0.0 ? `+${row.rating}` : `-${Math.abs(row.rating)}`}
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