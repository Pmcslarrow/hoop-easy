/* Packages */
import React, { useEffect, useState } from 'react';
import { auth } from '../../config/firebase';
import { bouncyArc } from 'ldrs'

/* Components */
import { CreateGameForm } from '../../components/form/CreateGameForm'
import { CreateGameButton}  from '../../components/ui/CreateGameButton';
import { PlayerOverallRating } from '../../components/ui/PlayerOverallRating';
import { Navbar } from '../../components/ui/Navbar';
import { Welcome } from './Welcome';
import { MyGames } from './MyGames';
import { History } from './History';
import { RatingsSection } from './RatingsSection';
import axios from 'axios'

/* Styling */
import '../../assets/styling/homepage.css';
import OverallRatingAnimation from '../../components/ui/OverallRatingAnimation';
bouncyArc.register()

const Homepage = ({ props }) => {
    const { setAuthenticationStatus, currentUserID, setCurrentUserID } = props
    const [isCreateGameActive, setCreateGameActive] = useState(false);
    const [refreshToken, setRefreshToken] = useState(0)
    const [isLoading, setLoading] = useState(true);
    const [animateOverallRating, setAnimateOverallRating] = useState({
        animate: false,        
        previousOverall: ''
    });

    useEffect(() => {
        const getCurrentUserID = async () => {
            setLoading(true); 
            try {
                const currentUserEmail = auth?.currentUser?.email
                const response = await axios.get(`https://hoop-easy-production.up.railway.app/api/getCurrentUserID?email=${currentUserEmail}`)
                setCurrentUserID(response.data)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false); 
            }
        };    
        getCurrentUserID();
    }, [refreshToken, animateOverallRating]);

    /* Show loading animation if loading */
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

    if (animateOverallRating.animate) {
        return <OverallRatingAnimation 
            currentUserID={currentUserID}
            animateOverallRating={animateOverallRating} 
            setAnimateOverallRating={setAnimateOverallRating} 
        />
    }

  return (
    <div className="dashboard-container">

        { isCreateGameActive && 
            <CreateGameForm 
                auth={auth} 
                refreshToken={refreshToken} 
                setRefreshToken={setRefreshToken} 
                setCreateGameActive={setCreateGameActive} 
                isCreateGameActive={isCreateGameActive} 
            />
        }

        <CreateGameButton setCreateGameActive={setCreateGameActive} isCreateGameActive={isCreateGameActive} />
        <PlayerOverallRating currentUserID={currentUserID} refreshToken={refreshToken} />
        <Navbar setAuthenticationStatus={setAuthenticationStatus} searchBar={true} profilePic={true} />

        <Welcome />
        
        <MyGames props={{setRefreshToken, refreshToken, setAnimateOverallRating}} />

        <History currentUserID={currentUserID} />

        <RatingsSection currentUserID={currentUserID}  />
    </div>
  );
  
};

export default Homepage;