/* Packages */
import React, { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { getDocs, collection, where, query } from 'firebase/firestore'
import { bouncyArc } from 'ldrs'

/* Components */
import { CreateGameForm } from './components/CreateGameForm'
import { CreateGameButton}  from './components/CreateGameButton';
import { Navbar } from './components/Navbar';
import { Welcome } from './components/Welcome';
import { MyGames } from './components/MyGames';
import { FindGames } from './components/FindGames';
import { History } from './components/History';
import { RatingsSection } from './components/RatingsSection';

/* Styling */
import './homepage.css';
bouncyArc.register()

const Homepage = ({setAuthenticationStatus}) => {

    // State variables
    const [users, setUsers] = useState([]);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [currentUser, setCurrentUser] = useState({})
    const [availableGames, setAvailableGames] = useState([]);
    const [myPendingGames, setMyPendingGames] = useState([]);
    const [myConfirmedGames, setMyConfirmedGames] = useState([]);
    const [isCreateGameActive, setCreateGameActive] = useState(false);

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
        <Navbar />

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