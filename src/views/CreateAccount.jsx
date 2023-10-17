import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { handleError } from './ErrorHandler';
import { db } from '../config/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import './create.css';
import hoopEasyLogo from '../images/hoop-easy.png';
import navButtonImg from '../images/269dd16fa1f5ff51accd09e7e1602267.png';

function CreateAccount({ setAuthenticationStatus }) {
  const [showCustomizationForm, setShowCustomizationForm] = useState(false);

  useEffect(() => {
    logout();
    setAuthenticationStatus(false);
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.log(err);
    }
  }

  const toggleCustomizationForm = () => {
    setShowCustomizationForm(!showCustomizationForm)
  }

  function LeftPanel() {
    return (
      <div className="left-panel">
        left
      </div>
    );
  }

  function RightPanel() {
    return (
      <div className="right-panel">
        <h1>Join the fastest growing community in basketball</h1>

        <div onClick={toggleCustomizationForm}>
          <span className="rect">
            <h1>Create An Account</h1>
          </span>
          <p>already have one? login <b className="bold">here</b>.</p>
        </div>
      </div>
    );
  }

  function Header() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
  
    const Navbar = () => {
      return (
        <header>
          <img src={hoopEasyLogo} alt="Logo" />
          <div className="spacer"></div>
          <div className="logo">
            <img src={navButtonImg} style={{"width": "50px"}} onClick={toggleSidebar} alt="Navigation button (three lines)" />
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
  
  return (
    <div className="App">
      <Header />
      <main>
        {showCustomizationForm ? (
          <PlayerCustomizationForm />
        ) : (
          <>
            <LeftPanel />
            <RightPanel />
          </>
        )}
      </main>
    </div>
  );
}






function PlayerCustomizationForm() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const [errorMessage, setMessage] = useState('');
  const [error, setError] = useState(false)
  const userCollectionRef = collection(db, "users");
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      addUserData();

      await sendEmailVerification(userCredential.user);
      setMessage("Please verify your email.");
      setError(true);

      setTimeout(() => {
        navigate("/");
      }, 5000);

    } catch(err) {
      handleError(setError, setMessage, err);
    }
  };

  const addUserData = async () => {
    const currentDate = Timestamp.now();
    const atIndex = auth?.currentUser?.email?.indexOf('@');
    const userName = atIndex !== -1 ? auth?.currentUser?.email?.slice(0, atIndex) : '';

    await addDoc(userCollectionRef, {
      name: userName,
      email: auth?.currentUser?.email,
      date: currentDate
    });
  };


  return (
    <div style={{"color": "white"}}>Form</div>
  );
}




export default CreateAccount;
