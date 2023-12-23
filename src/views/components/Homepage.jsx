/* Packages */
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase';
import { getDocs, collection } from 'firebase/firestore'
import { bouncyArc } from 'ldrs'


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

const Homepage = ({setAuthenticationStatus, currentUser, setCurrentUser }) => {

    // State variables
    const [users, setUsers] = useState([]);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [availableGames, setAvailableGames] = useState([]);
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
                const usersData = await getDocs(usersCollectionRef);
                const filteredUsersData = usersData.docs.map((doc) => ({...doc.data(), id: doc.id}));
                setUsers(filteredUsersData);
     
                const currentUser = filteredUsersData.find((user) => user.email === auth?.currentUser?.email);
                if (currentUser) {
                    setCurrentUserID(currentUser.id);
                    setCurrentUser(currentUser)
                    setMyConfirmedGamesRef(`users/${currentUser.id}/confirmedGames`);
                    setMyPendingGamesRef(`users/${currentUser.id}/pendingGames`);
                 
                    const fetchAndMapData = async (path) => {
                        const collectionRef = collection(db, path);
                        const docs = await getDocs(collectionRef);
                        return docs.docs.map((doc) => ({...doc.data(), id: doc.id}));
                    }
                 
                    const confirmedGames = await fetchAndMapData(`users/${currentUser.id}/confirmedGames`);
                    const pendingGames = await fetchAndMapData(`users/${currentUser.id}/pendingGames`);
                 
                    setMyConfirmedGames(confirmedGames);
                    setMyPendingGames(pendingGames);
                }

                if (auth?.currentUser) {
                    const gamesData = await getDocs(gamesCollectionRef);
                    const filteredGamesData = gamesData.docs.map((doc) => ({...doc.data(), id: doc.id}));
                    let joinedGames = filteredGamesData.map(game => {
                        let user = filteredUsersData.find(user => user.id === game.playerID);
                        if (user && user.email !== auth?.currentUser?.email) {
                           return {
                               ...game,
                               ...user
                           }
                        }
                        return null
                    }).filter(game => game !== null);                
                    setAvailableGames(joinedGames);
                }
                 
            } catch(err) {
                console.log(err);
            }finally {
                // Set loading to false regardless of success or failure
                setLoading(false);
              }
        }

        fetchData();
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
            db={db}
            currentUser={currentUser}
            currentUserID={currentUserID}
            setRefreshToken={setRefreshToken}
            refreshToken={refreshToken}
            myPendingGames={myPendingGames}
            myConfirmedGames={myConfirmedGames}
        />
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
        <History currentUser={currentUser} currentUserID={currentUserID} db={db} />

        <RatingsSection currentUser={currentUser} currentUserID={currentUserID} db={db} />
    </div>
  );
  
};

export default Homepage;