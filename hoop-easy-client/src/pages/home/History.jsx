import React, { useEffect, useState } from 'react';
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
     }, [currentUserID])
     
    const tableHeaderStyle = {
        textAlign: 'center',
        fontSize: '25px'
    };
    const tableCellStyle = {
        border: '1px solid rgba(255, 255, 255, 0.5)',
        padding: '5px'
    };

    return (
        <section id="history">
          <div id="history-container">
            <h1 style={{fontSize: '8vw'}}>Your History</h1>
            <div></div>
            <p style={{textAlign: 'center'}}>See how previous games stack up.</p>

            <div style={{overflow: 'auto' }}> 
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead style={tableHeaderStyle}>
                  <tr>
                    <th style={{ ...tableCellStyle, height: '50px' }}>When</th>
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