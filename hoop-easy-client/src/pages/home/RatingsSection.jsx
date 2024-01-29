import React, { useEffect, useState } from 'react';
import setGridStyle from '../../utils/setGridStyle';
import { Chart } from 'react-google-charts';
import { convertToLocalTime } from '../../utils/locationTimeFunctions'
import axios from 'axios'

const RatingsSection = ({ currentUserID }) => {
    const [data, setData] = useState([])

    useEffect(() => {
        const fetchGameHistory = async () => {            
            const response = await axios.get(`https://hoop-easy-production.up.railway.app/api/getHistory?userID=${currentUserID}`)
            let data = response.data
            const updatedData = data.map((obj) => {
                obj.game_date = convertToLocalTime(obj.game_date);
                return obj;
            });
            updatedData.sort((a, b) => new Date(b.game_date) - new Date(a.game_date));
            const simplifiedData = updatedData.map(({ game_date, rating }) => ({ game_date, rating }));
            setData(simplifiedData)
        }   
        fetchGameHistory()

     }, [])
     
    
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
        <section id="ratings">
          <div id="history-container" style={gridStyle}>
            <h1 style={h1Style}>Your Ratings</h1>
            <div style={horizontalLine}></div>
            <p style={paragraph}>Courtside access to all your stats.</p>
            <div style={{ ...graphGrid, overflow: 'auto', backgroundColor: 'white' }}> 
            { data.length > 0 ? <LineChart data={data} /> : <div style={{position: 'relative', color: 'black', top: '50%', transform: 'translateY(-50%)'}}>Play some games to visualize your data!</div>}
            
            </div>
          </div>
        </section>
      );          
}


const LineChart = ({ data }) => {

  const chartData = [['Date', 'Rating']].concat(
    data.map(({ game_date, rating }) => [new Date(game_date), parseFloat(rating)])
  );

  return (
    <Chart
      width={'100%'}
      height={'400px'}
      chartType="LineChart"
      loader={<div>Loading Chart</div>}
      data={chartData}
      options={{
        hAxis: {
          title: 'Date',
          format: 'MMM d, yyyy',
        },
        vAxis: {
          title: 'Rating',
        },
      }}
    />
  );
};

export { RatingsSection }