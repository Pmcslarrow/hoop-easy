import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../config/firebase";
import { createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { handleError } from '../../utils/ErrorHandler.js';
import { Navbar } from '../../components/ui/Navbar'
import { db } from '../../config/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import axios from 'axios';
import carouselImage1 from '../../assets/images/CAROUSEL IMAGES/1.png'

import '../../assets/styling/create.css';


{ /* CREATE ACCOUNT */}
function CreateAccount({ props }) {
  const { setAuthenticationStatus } = props
  const navigate = useNavigate()
  const [showCustomizationForm, setShowCustomizationForm] = useState(false);

  useEffect(() => {
    document.title = 'HoopEasy';
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
    const imageText = "PICK UP 1v1 GAMES.\nANYIME, ANYWHERE."
  
    return (
      <>
        <div className="left-panel">
            <div className="slider-item">
                <img src={carouselImage1} alt='Carousel' />
                <div className="text-container">
                    <p>{imageText}</p>
                </div>
            </div>
        </div>
      </>
    );
  };
   

  function RightPanel() {
    return (
      <div className="right-panel">
        <h1 className='hide'>Join the fastest growing community in basketball</h1>
        
        <div>
            <div>
                <div id='create-account-rect-wrapper' onClick={toggleCustomizationForm} >
                    <span className="rect center" >
                        <h1>Create An Account</h1>
                    </span>
                </div>
            </div>

            <div>
                <p onClick={navigateLogin} >Already have an account? Login <b id='here' className="bold">here</b>.</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar setAuthenticationStatus={setAuthenticationStatus} searchBar={true} profilePic={true}/>
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

  const isEmpty = () => {
    if (
        formData.firstName.trim() === '' ||
        formData.lastName.trim() === '' ||
        formData.email.trim() === '' ||
        formData.username.trim() === '' ||
        formData.password.trim() === '' ||
        formData.retypePassword.trim() === ''
      ) {
        handleError(setError, setMessage, {
          code: 'auth/incomplete-form-error',
          message: 'Please fill in all required fields.',
        });
        return true;
      }
  }

  const passwordsDontMatch = () => {
    if ( formData.password !== formData.retypePassword ) {
        handleError(setError, setMessage, {
          code: 'auth/password-and-retype-password-error',
          message: 'Your password and retyped password do not match.',
        });
        return true
      }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty()) {
        return
    }
    if ( passwordsDontMatch() ) {
        return
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      addNewUser();
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
  

  const addNewUser = async () => {
    const currentDate = Timestamp.now();
    const { firstName, lastName, username, heightFt, heightInches, middleInitial } = formData
    const request = {
        username: username,
        email: auth?.currentUser?.email,
        firstName: firstName,
        lastName: lastName,
        middleInitial: middleInitial,
        heightFt: heightFt,
        heightInches: heightInches,
        gamesAccepted: '0',
        gamesDenied: '0',
        gamesPlayed: '0',
        overall: '60',
        date: currentDate
    }
    axios.post('https://hoop-easy-production.up.railway.app/api/newUser', request)
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
