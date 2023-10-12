import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../config/firebase"
import { signOut, signInWithEmailAndPassword } from 'firebase/auth'
import { handleError } from './ErrorHandler';
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
        console.log("Reset password")
      }
      


  return (
    <div className="container">
      <div>
        <form name="message" onSubmit={handleSubmit}>

            {/* Email section */}
            <span>
              <label htmlFor="Email">Email</label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </span>

            {/* Password section */}
            <span>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </span>

            {/* Login button */}
            <span>
              <input type="submit" id="submit" value="Login" />
            </span>

            {/* Forgot Password */}
            <span>forgot password? click here</span>

            {/* Create an account */}
            <span>
              <input type="button" value="Create Account" onClick={createAccount} />
            </span>

          {errorStatus && <p> {errorMessage} </p>}

        </form>
      </div>
    </div>
  );
}

export default LoginPage;