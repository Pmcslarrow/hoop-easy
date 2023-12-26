/* Packages */
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase';
import { getDocs, collection } from 'firebase/firestore'
import { bouncyArc } from 'ldrs'
import { FirebaseQuery } from '../functions/FirebaseQuery'

/* Components */
import { CreateGameForm } from './CreateGameForm'
import { CreateGameButton}  from './CreateGameButton';
import { PlayerOverallRating } from './PlayerOverallRating';
import { Navbar } from './Navbar';
import { Welcome } from './Welcome';
import { MyGames } from './MyGames';
import { FindGames } from './FindGames';
import { History } from './History';
import { RatingsSection } from './RatingsSection';

/* Styling */
import '../styling/homepage.css';
bouncyArc.register()



const Homepage = ({ props }) => {
    const {setAuthenticationStatus, currentUser, setCurrentUser, availableGames, setAvailableGames, globalRefresh, setGlobalRefresh } = props
    const query = new FirebaseQuery( auth, db, null, currentUser)

    // State variables
    const [users, setUsers] = useState([]);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [myPendingGames, setMyPendingGames] = useState([]);
    const [myConfirmedGames, setMyConfirmedGames] = useState([]);
    const [isCreateGameActive, setCreateGameActive] = useState(false);
    //const [currentUser, setCurrentUser] = useState({})

    // Firestore collection references
    const usersCollectionRef = collection(db, "users");
    const gamesCollectionRef = collection(db, 'Games');
    const [myConfirmedGamesRef, setMyConfirmedGamesRef] = useState('');
    const [myPendingGamesRef, setMyPendingGamesRef] = useState('');

    // Loading
    const [refreshToken, setRefreshToken] = useState(0)
    const [isLoading, setLoading] = useState(true);


    /* Getting all user info from database */
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {

                const users = await query.getAllUsers();
                const currentUser = await query.getCurrentUserData( users );
                const currentUserID = currentUser.id
                const confirmedGames = await query.getConfirmedGames( currentUserID )
                const pendingGames = await query.getPendingGames( currentUserID )
                const availableGames = await query.getAvailableGames()


                setUsers(users)
                setCurrentUser(currentUser)
                setMyConfirmedGames(confirmedGames)
                setMyPendingGames(pendingGames)
                setAvailableGames(availableGames)
                 
            } catch(err) {
                console.log(err);
            }finally {
                // Set loading to false regardless of success or failure
                setLoading(false);
              }
        }

        fetchData();
     }, [refreshToken, globalRefresh]);

     

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
                db={db} 
                gamesCollectionRef={gamesCollectionRef} 
                usersCollectionRef={usersCollectionRef} 
                refreshToken={refreshToken} 
                setRefreshToken={setRefreshToken} 
                setCreateGameActive={setCreateGameActive} 
                isCreateGameActive={isCreateGameActive} 
            />
            
        }

        <CreateGameButton setCreateGameActive={setCreateGameActive} isCreateGameActive={isCreateGameActive} />
        <PlayerOverallRating overallRating={currentUser.overall}/>
        <Navbar setAuthenticationStatus={setAuthenticationStatus} searchBar={true} profilePic={true} />

        <Welcome />
        
        <MyGames 
            props={{
                db,
                currentUser,
                //currentUserID,
                setRefreshToken,
                refreshToken,
                myPendingGames,
                myConfirmedGames
            }}
        />


        {/*
        <FindGames 
            db={db}
            currentUser={currentUser}
            currentUserID={currentUserID}
            setRefreshToken={setRefreshToken}
            refreshToken={refreshToken}
            myConfirmedGamesRef={myConfirmedGamesRef}
            gamesCollectionRef={gamesCollectionRef}
            availableGames={availableGames}
        />
        */}

        <History currentUser={currentUser} currentUserID={currentUserID} db={db} />

        <RatingsSection currentUser={currentUser} currentUserID={currentUserID} db={db} />
    </div>
  );
  
};

export default Homepage;