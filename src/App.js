import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, BrowserRouter as Router } from 'react-router-dom';

/* Routes */
import LoginPage from './views/LoginPage';
import Homepage from './views/Homepage';
import CreateAccount from './views/CreateAccount';

function App() {
  const [isAuthenticated, setAuthenticationStatus] = useState(false);

  useEffect(() => {
    console.log(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Homepage setAuthenticationStatus={setAuthenticationStatus} /> : <CreateAccount setAuthenticationStatus={setAuthenticationStatus} />} />
       {/*  <Route path="/createAccount" element={<CreateAccount setAuthenticationStatus={setAuthenticationStatus} />} /> */}
        <Route path="/login" element={<LoginPage setAuthenticationStatus={setAuthenticationStatus} />} />
        <Route path="/homepage" element={isAuthenticated ? <Homepage setAuthenticationStatus={setAuthenticationStatus} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
