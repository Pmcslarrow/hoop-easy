// PlayerOverallRating.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios'

const PlayerOverallRating = ({currentUserID, refreshToken}) => {
    const [overallRating, setOverallRating] = useState(null)

    useEffect(() => {
        const getOverallRating = async () => {
            const response = await axios.get(`http://localhost:5001/api/getUserWithID?userID=${currentUserID}`)
            setOverallRating(parseFloat(response.data.overall).toFixed(2))
        }

        getOverallRating()
    }, [refreshToken])

    const card = {
        position: 'fixed',
        width: '60px',
        height: '60px',
        bottom: '0',
        left: '0',
        marginLeft: '25px',
        marginBottom: '25px',
        borderRadius: '50%',
        overflow: 'hidden',
    };

    const getBackgroundColor = () => {
        const rating = parseFloat(overallRating);
        const normalizedRating = (rating - 60) / (99 - 60);
        return `linear-gradient(to right, red ${100 - normalizedRating * 100}%, yellow ${100 - normalizedRating * 100}%, green ${100 - normalizedRating * 100}%)`;
    };

    const Circle = () => {
        const outerCircleStyle = {
            width: '100%',
            height: '100%',
            background: getBackgroundColor(),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.2em',
            fontWeight: 'bold',
            color: '#fff',
        };

        const innerCircleStyle = {
            width: '96%',
            height: '96%',
            background: 'black',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1em',
            fontWeight: 'bold',
            color: 'white',
        };

        return (
            <div style={outerCircleStyle}>
                <div style={innerCircleStyle}>
                    {overallRating}
                </div>
            </div>
        );
    };

    return <div style={card}><Circle /></div>;
};

export { PlayerOverallRating };
