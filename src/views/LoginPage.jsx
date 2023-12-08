import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../config/firebase"
import { signOut, signInWithEmailAndPassword } from 'firebase/auth'
import { handleError } from './ErrorHandler';
import { motion, AnimatePresence } from 'framer-motion';
import hoopEasyLogo from '../images/hoop-easy.png';
import navButtonImg from '../images/269dd16fa1f5ff51accd09e7e1602267.png';
import './login.css';

// Utlizes firebases' authentication processes such that the user cannot get into the dashboard without
// having an account, or having their email verified. 

function LoginPage({ setAuthenticationStatus }) {
      const navigate = useNavigate();
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [errorStatus, setError] = useState(false)
      const [errorMessage, setMessage] = useState('')

      useEffect(() => {
        logout()
        setAuthenticationStatus(false)
      }, [])
    
      const handleSubmit = async (e) => {
        e.preventDefault()
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);

          if (userCredential.user.emailVerified) {
            setAuthenticationStatus(true);
            navigate("/homepage");
          } else {
            setMessage("Please verify your email before logging in.");
            setError(true);
          }
        } catch(err) {
          handleError(setError, setMessage, err);      
        }
      };

      const handleEmailChange = (e) => {
        setEmail(e.target.value)
      }

      const handlePasswordChange = (e) => {
        setPassword(e.target.value)
      }

      const logout = async () => {
        try {
          await signOut(auth)
        } catch (err) {
          console.log(err)
        }
      }

      const createAccount = () => {
        navigate("/createAccount")
      }

      const resetPassword = () => {
        navigate("/resetPassword")
      }
      
      return (
        <>
        <Header />
        
        <div className='container'>
          <div className='col'>
            <h1>LOG INTO YOUR ACCOUNT</h1>
              <label htmlFor="username" style={{ width: '75%' }}>Email
                <input type="text" id="username" name="username" style={{ width: '100%', padding: '2px' }} onChange={handleEmailChange}/>
              </label>
              <label htmlFor="password" style={{ width: '75%' }}>Password
                <input type="password" id="password" name="password" style={{ width: '100%', padding: '2px' }} onChange={handlePasswordChange}/>
              </label>
            <button onClick={handleSubmit}>SIGN IN</button>
            <p onClick={resetPassword} id='forgot-password'>Forgot your Password?</p>
            <p className='no-underline'>{errorStatus ? errorMessage : ""}</p>
          </div>

        </div>
        </>
      );
}


{ /* HEADER */}
function Header() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const Navbar = () => {
    return (
      <header>
        <img src={hoopEasyLogo} alt="Logo" />
        <div className="spacer"></div>
        <div className="logo">
          <img src={navButtonImg} style={{"width": "50px"}} onClick={toggleSidebar} id='drop-down' alt="Navigation button (three lines)" />
        </div>
      </header>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Navbar />

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="sidebar"
            initial={{ width: '100%', height: '0%', zIndex: 1 }} // Add a higher z-index
            animate={{ width: '100%', height: '88%', zIndex: 1 }} // Add a higher z-index
            exit={{
              width: '100%',
              height: '0%',
              transition: { duration: 0.3 },
            }}
          >
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              <a href="#" className="sidebar-link">ABOUT HOOP:EASY</a>
              <a href="#" className="sidebar-link">Rankings</a>
              <a href="#" className="sidebar-link">FAQs</a>
              <a href="#" className="sidebar-link">HELP</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default LoginPage;