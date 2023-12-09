import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { handleError } from './ErrorHandler';
import { db } from '../config/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import hoopEasyLogo from '../images/hoop-easy.png';
import navButtonImg from '../images/269dd16fa1f5ff51accd09e7e1602267.png';
import { FaRegCircle } from "react-icons/fa6";
import AnchorLink from 'react-anchor-link-smooth-scroll'


import randomPhoto from '../images/missingImage.jpg'
import randomPhoto2 from '../images/269dd16fa1f5ff51accd09e7e1602267.png'
import randomPhoto3 from '../images/hoop-easy.png'
import randomPhoto4 from '../images/icons8-male-user-48.png'

import './create.css';


{ /* CREATE ACCOUNT */}
function CreateAccount({ setAuthenticationStatus }) {
  const navigate = useNavigate()
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

  const navigateLogin = () => {
    navigate("/login")
  }

  const toggleCustomizationForm = () => {
    setShowCustomizationForm(!showCustomizationForm)
  }



  const LeftPanel = () => {
    const images = [randomPhoto, randomPhoto2, randomPhoto3, randomPhoto4];
    const [prevSlideIndex, setPrev] = useState(0);
    const [currSlideIndex, setCurr] = useState(0);
    const circles = document.getElementsByClassName('circles');
    const sliderRef = useRef(null);
  
    useEffect(() => {
      circles[0].classList.add("active");
    }, []);
  
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        handleSlideChange(currSlideIndex);
      }, 5000);
  
      return () => clearTimeout(timeoutId);
    }, [currSlideIndex]); // Include currSlideIndex in the dependency array
  
    const handleSlideChange = (index) => {
      const updatedIndex = (index + 1) % images.length;
      setCurr(updatedIndex);
      const slideElement = document.getElementById(`slide-${updatedIndex}`); // Use updatedIndex here
      if (slideElement) {
        slideElement.scrollIntoView({ behavior: 'smooth' });
      }
      circles[updatedIndex].classList.add("active");
  
      if (updatedIndex !== prevSlideIndex) {
        circles[prevSlideIndex].classList.remove("active");
      }
      setPrev(updatedIndex);
    };
  
    return (
      <>
        <div className="left-panel">
          <div className="sliderWrapper" ref={sliderRef}>
            <div className="slider">
              {images.map((img, i) => (
                <img key={i} src={img} alt={`Slider img ${i}`} id={`slide-${i}`} />
              ))}
            </div>
          </div>
          <div className='slider-nav'>
            {images.map((_, i) => (
              <div key={i} >
                <FaRegCircle className="circles" key={i}/>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };
  
  
    
   

  function RightPanel() {
    return (
      <div className="right-panel">
        <h1>Join the fastest growing community in basketball</h1>
        
        <div>
            <div>
                <div onClick={toggleCustomizationForm}>
                    <span className="rect">
                        <h1>Create An Account</h1>
                    </span>
                </div>
            </div>

            <div>
                <p onClick={navigateLogin} >already have an account? login <b id='here' className="bold">here</b>.</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <main>
        {showCustomizationForm ? (
          <PlayerCustomizationForm formToggle={toggleCustomizationForm}/>
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




{ /* PLAYER CUSTOMIZATION FORM */}
function PlayerCustomizationForm({ formToggle }) {
  const navigate = useNavigate();
  const [errorStatus, setError] = useState(false);
  const [errorMessage, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const userCollectionRef = collection(db, "users");
  const [formData, setFormData] = useState({
    profilePhoto: null,
    firstName: '',
    middleInitial: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    retypePassword: '',
    heightFt: '',
    heightInches: '',
    gamesAccepted: '',
    gamesDenied: '',
    gamesPlayed: ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
  
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Define the allowed image MIME types
  
      if (allowedTypes.includes(file.type)) {
        setFormData({
          ...formData,
          profilePhoto: file,
        });
      } else {
        alert('Please select a valid image file (JPEG, PNG, or GIF).');
        e.target.value = '';
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if any of the required fields are empty
    if (
      formData.firstName.trim() === '' ||
      formData.lastName.trim() === '' ||
      formData.email.trim() === '' ||
      formData.username.trim() === '' ||
      formData.password.trim() === '' ||
      formData.retypePassword.trim() === ''
    ) {
      // Handle the incomplete form error
      handleError(setError, setMessage, {
        code: 'auth/incomplete-form-error',
        message: 'Please fill in all required fields.',
      });
      return;
    }

    if ( formData.password !== formData.retypePassword ) {
      handleError(setError, setMessage, {
        code: 'auth/password-and-retype-password-error',
        message: 'Your password and retyped password do not match.',
      });
      return
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
  
      addUserData();
  
      await sendEmailVerification(userCredential.user);
      setMessage("Please verify your email.");
      setError(true);
  
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (err) {
      handleError(setError, setMessage, err);
    }
  };
  

  const addUserData = async () => {
    const currentDate = Timestamp.now();
    const { firstName, lastName, username, heightFt, heightInches } = formData

    await addDoc(userCollectionRef, {
        username: username,
        email: auth?.currentUser?.email,
        firstName: firstName,
        lastName: lastName,
        heightFt: heightFt,
        heightInches: heightInches,
        gamesAccepted: '0',
        gamesDenied: '0',
        gamesPlayed: '0',
        date: currentDate
    });
  };

  return (
    <form>
      <div className="form-container">
        <div id='back-button-side'>
          <span className='flex-col'>
            <div></div>
            <div>
              <button type='button' id='back-button' onClick={formToggle}>Back</button>
            </div>
          </span>
        </div>
        <div id="user-input">
          <span className='flex-row'>
            <label>
              First Name*
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              MI
              <input
                type="text"
                name="middleInitial"
                id="middleInitial"
                value={formData.middleInitial}
                onChange={handleInputChange}
              />
            </label>
          </span>
          <label>
            Last Name*
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Email*
            <input
              type="text"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Username*
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Password*
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Retype Password*
            <input
              type="password"
              name="retypePassword"
              id="retypePassword"
              value={formData.retypePassword}
              onChange={handleInputChange}
              required
            />
          </label>
        </div> {/* user-input */}

        <div id='optional'>
          <span className='flex-col'>
            <div>
              <label>Height
              <span className='flex-row'>
                <label>
                    <input
                      type="text"
                      name="heightFt"
                      id="heightFt"
                      value={formData.heightFt}
                      onChange={handleInputChange}
                      placeholder="ft"
                    />
                  </label>
                  <label>
                    <input
                      type="text"
                      name="heightInches"
                      id="heightInches"
                      value={formData.heightInches}
                      onChange={handleInputChange}
                      placeholder="in"
                    />
                  </label>
              </span>
              <label>
                Weight
                <input
                  type="text"
                  name="weight"
                  id="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="lbs"
                />
              </label>
            </label>
            </div>
            <button type="submit" onClick={handleSubmit} id='submit-button'>
              Submit
            </button>
          </span>
        </div> { /* Optional */}
      </div> { /* form-container */}
      <p id='error-message'>{errorStatus ? errorMessage : ""}</p>
    </form>
    
  );
  
}




export default CreateAccount ;
