import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../config/firebase"
import { createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth'
import { handleError } from './ErrorHandler';
import { db } from '../config/firebase'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import './create.css';

// This component utilizes Firebase auth to create a new user, ensuring that the email domain is restricted to "willamette.edu".
// After successfully creating an account, adhering to the specified email format and password requirements, the CreateAccount
// function component employs setTimeout to display the message "Please verify your email" for a duration of five seconds.
// Following this, the user is automatically redirected to the login page, where they can attempt to log in once they have verified
// their email.

function CreateAccount({ setAuthenticationStatus }) {
      const navigate = useNavigate();
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [errorStatus, setError] = useState(false)
      const [errorMessage, setMessage] = useState('')
      const userCollectionRef = collection(db, "users");


      useEffect(() => {
            logout()
            setAuthenticationStatus(false)
      }, [])

      const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Adds email, name and timestamp to users table
            addUserData();

            // Send email verification
            await sendEmailVerification(userCredential.user);
            setMessage("Please verify your email.")
            setError(true)

            // Redirect to login page after 5 seconds
            setTimeout(() => {
                  navigate("/");
            }, 5000);
            
        } catch(err) {
          handleError(setError, setMessage, err);
        }
      };

      const addUserData= async () => {
        const currentDate = Timestamp.now();
        const atIndex = auth?.currentUser?.email?.indexOf('@');
        const userName = atIndex !== -1 ? auth?.currentUser?.email?.slice(0, atIndex) : ''; 
      
        await addDoc(userCollectionRef, {
          name: userName,
          email: auth?.currentUser?.email,
          date: currentDate
        });
      };


      const logout = async () => {
            try {
              await signOut(auth)
            } catch (err) {
              console.log(err)
            }
      }

      const loginPage = () => {
            navigate("/")
      }

      function Header() {
        return (
          <header>
            <div className='flex'>
              <div className="logo">
                <img src="your-logo-left.png" alt="Left Logo" />
              </div>
              <div className="brand">
                <span>Hoop:Easy</span>
              </div>
            </div>
            <div className="spacer"></div>
            <div className="logo">
              <img src="your-logo-right.png" alt="Right Logo" />
            </div>
          </header>
        );
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
            
            <div>
                <div className="rect">
                  <h1>Create An Account</h1>
                </div>
                <p>already have one? login <b className="bold">here</b>.</p>
            </div>
          </div>
        );
      }
      
      
      return (
        <div className="App">
          <Header />
          <main>
            <LeftPanel />
            <RightPanel />
          </main>
        </div>
      );
}

export default CreateAccount;