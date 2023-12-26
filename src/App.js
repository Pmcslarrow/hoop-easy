import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, BrowserRouter as Router } from 'react-router-dom';


/* Routes */
import LoginPage from './views/components/LoginPage';
import Homepage from './views/components/Homepage';
import CreateAccount from './views/components/CreateAccount';
import ResetPassword from './views/components/ResetPassword';
import Profile from './views/components/Profile';
import PlayerRankings from './views/components/PlayerRankings';
import FindGamePage from './views/components/FindGamePage';

/* Context */
export const UserContext = React.createContext();
export const UserIDContext = React.createContext()



function App() {
  const [isAuthenticated, setAuthenticationStatus] = useState(false);
  const [currentUser, setCurrentUser] = useState({})
  const [currentUserID, setCurrentUserID] = useState(null);
  const [availableGames, setAvailableGames] = useState([]);


  useEffect(() => {
    console.log(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <UserContext.Provider value={currentUser}>
        <Router>
        <Routes>
            <Route path="/" element={isAuthenticated ? <Homepage props={{ setAuthenticationStatus }} /> : <CreateAccount props={{ setAuthenticationStatus }} />} />
            <Route path="/createAccount" element={<CreateAccount props={{ setAuthenticationStatus }} />} />
            <Route path="/login" element={<LoginPage props={{ setAuthenticationStatus }} />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/homepage" element={isAuthenticated ? <Homepage props={{ setAuthenticationStatus, currentUser, setCurrentUser, availableGames, setAvailableGames }} /> : <Navigate to="/" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile props={{ setAuthenticationStatus }} /> : <Navigate to="/" />} />
            <Route path='/rankings' element={isAuthenticated ? <PlayerRankings props={{ setAuthenticationStatus, currentUser }} /> : <Navigate to="/" />} />
            <Route path='/findGame' element={isAuthenticated ? <FindGamePage props={{ setAuthenticationStatus, currentUser, setCurrentUser, availableGames, setAvailableGames }} /> : <Navigate to="/" />} />
        </Routes>

        </Router>
    </UserContext.Provider>
  );
}

export default App;
