import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { db, auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const history = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter a valid email");
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Check your email");
      history("/login");
    } catch (err) {
      alert(err.code);
    }
  };

  return (
    <div className="App" style={{padding: '50px'}}>
      <h1>Forgot Password</h1>
      <form onSubmit={(e) => handleSubmit(e)}>
        <label>
          Enter email:
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{width: '300px', padding: '5px'}}
          />
          <br />
          <br />
        </label>
        <button type="submit" id="submit-button" style={{width: '100px'}}>Reset</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
