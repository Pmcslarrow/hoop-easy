import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import {APIProvider} from '@vis.gl/react-google-maps';

/* Routes */
import CreateAccount from './pages/auth/CreateAccount';
import LoginPage from './pages/auth/LoginPage';
import Homepage from './pages/home/Homepage';
import ResetPassword from './components/form/ResetPassword';
import Profile from './pages/navigation/Profile';
import PlayerRankings from './pages/navigation/PlayerRankings';
import FindGamePage from './pages/navigation/FindGamePage';
import UnderConstruction from './pages/navigation/UnderConstruction';

/* Context */
export const UserContext = React.createContext();
export const UserIDContext = React.createContext()



function App() {
  const [isAuthenticated, setAuthenticationStatus] = useState(false);
  const [currentUser, setCurrentUser] = useState({})
  const [availableGames, setAvailableGames] = useState([]);
  const [currentUserID, setCurrentUserID] = useState(null);


  useEffect(() => {
    console.log(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <APIProvider apiKey={"AIzaSyD-qamxgHTK8gbNFAp5hhq43-HIN6wCcRs"}>
        <UserContext.Provider value={currentUser}>
            <Router>
            <Routes>
                <Route path="/" element={isAuthenticated ? <Homepage props={{ setAuthenticationStatus }} /> : <CreateAccount props={{ setAuthenticationStatus }} />} />
                <Route path="/createAccount" element={<CreateAccount props={{ setAuthenticationStatus }} />} />
                <Route path="/login" element={<LoginPage props={{ setAuthenticationStatus }} />} />
                <Route path="/resetPassword" element={<ResetPassword />} />
                <Route path="/homepage" element={isAuthenticated ? <Homepage props={{ setAuthenticationStatus, currentUser, setCurrentUser, currentUserID, setCurrentUserID }} /> : <Navigate to="/" />} />
                <Route path="/profile" element={isAuthenticated ? <Profile props={{ setAuthenticationStatus, currentUserID }} /> : <Navigate to="/" />} />
                <Route path='/rankings' element={isAuthenticated ? <PlayerRankings props={{ setAuthenticationStatus, currentUser }} /> : <Navigate to="/" />} />
                <Route path='/findGame' element={isAuthenticated ? <FindGamePage props={{ setAuthenticationStatus, currentUser, setCurrentUser, availableGames, setAvailableGames }} /> : <Navigate to="/" />} />
                <Route path='/construction' element={<UnderConstruction />} />
            </Routes>

            </Router>
        </UserContext.Provider>
    </APIProvider>
  );
}

export default App;
