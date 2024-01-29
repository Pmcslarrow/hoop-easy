import { useEffect, useState } from 'react';
import axios from 'axios';

import '../../assets/styling/ratingAnimation.css'

export default function OverallRatingAnimation({ currentUserID, animateOverallRating, setAnimateOverallRating }) {
    const [newRating, setNewRating] = useState(null);
    const [currentValue, setCurrentValue] = useState(parseFloat(animateOverallRating.previousOverall).toFixed(2));

    useEffect(() => {
        const getOverallRating = async () => {
            const response = await axios.get(`https://hoop-easy-production.up.railway.app/api/getUserWithID?userID=${currentUserID}`);
            setNewRating(parseFloat(response.data.overall).toFixed(2));
        };
        getOverallRating();
    }, [currentUserID]);

    useEffect(() => {
        let startTimestamp = null;
        let duration = 3000;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCurrentValue(parseFloat(progress * (newRating - parseFloat(animateOverallRating.previousOverall)) + parseFloat(animateOverallRating.previousOverall)).toFixed(2));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setTimeout(() => {
                    setAnimateOverallRating({ animate: false });
                }, 2500);
            }
        };

        if (newRating !== null) {
            window.requestAnimationFrame(step);
        }

    }, [newRating, animateOverallRating.previousOverall, setAnimateOverallRating]);

    const userGainedXp = newRating > parseFloat(animateOverallRating.previousOverall).toFixed(2)

    return (
        <div class="center-card">
            <div id='number-card'>
                <div id='card-value'>
                    {currentValue}
                </div>
                <p id="new-score" class="number" animate={userGainedXp.toString()}>New Overall Rating</p>
            </div>
        </div>
    )
}

