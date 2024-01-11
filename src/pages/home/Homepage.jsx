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
bouncyArc.register()



const Homepage = ({ props }) => {
    const { setAuthenticationStatus } = props
    const [currentUserID, setCurrentUserID] = useState(null);
    const [isCreateGameActive, setCreateGameActive] = useState(false);
    const [refreshToken, setRefreshToken] = useState(0)
    const [isLoading, setLoading] = useState(true);


    useEffect(() => {
        const getCurrentUserID = async () => {
            setLoading(true); 
            try {
                const currentUserEmail = auth?.currentUser?.email
                const response = await axios.get(`http://localhost:5001/api/getCurrentUserID?email=${currentUserEmail}`)
                setCurrentUserID(response.data)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false); 
            }
        };
    
        getCurrentUserID();
    }, [refreshToken]);
    

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
        
        <MyGames props={{setRefreshToken, refreshToken,}} />

        <History currentUserID={currentUserID} />

        <RatingsSection currentUserID={currentUserID}  />
    </div>
  );
  
};

export default Homepage;