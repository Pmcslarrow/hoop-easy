import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, BrowserRouter as Router } from 'react-router-dom';


/* Routes */
import LoginPage from './views/LoginPage';
import Homepage from './views/Homepage';
import CreateAccount from './views/CreateAccount';
import ResetPassword from './views/ResetPassword';
import Profile from './views/Profile';
import PlayerRankings from './views/components/PlayerRankings';

/* Context */
export const UserContext = React.createContext();
export const UserIDContext = React.createContext()



function App() {
  const [isAuthenticated, setAuthenticationStatus] = useState(false);
  const [currentUser, setCurrentUser] = useState({})
  const [currentUserID, setCurrentUserID] = useState(null);


  useEffect(() => {
    console.log(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <UserContext.Provider value={currentUser}>
        <Router>
        <Routes>
            <Route path="/" element={isAuthenticated ? <Homepage setAuthenticationStatus={setAuthenticationStatus} /> : <CreateAccount setAuthenticationStatus={setAuthenticationStatus} />} />
            <Route path="/createAccount" element={<CreateAccount setAuthenticationStatus={setAuthenticationStatus} />} />
            <Route path="/login" element={<LoginPage setAuthenticationStatus={setAuthenticationStatus} />} />
            <Route path="/resetPassword" element={<ResetPassword setAuthenticationStatus={setAuthenticationStatus} />} />
            <Route path="/homepage" element={isAuthenticated ? <Homepage setAuthenticationStatus={setAuthenticationStatus} currentUser={currentUser} setCurrentUser={setCurrentUser} /> : <Navigate to="/" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile setAuthenticationStatus={setAuthenticationStatus} /> : <Navigate to="/" />} />
            <Route path='/rankings' element={isAuthenticated ? <PlayerRankings setAuthenticationStatus={setAuthenticationStatus} currentUser={currentUser} /> : <Navigate to="/" />} />
        </Routes>
        </Router>
    </UserContext.Provider>
  );
}

export default App;
