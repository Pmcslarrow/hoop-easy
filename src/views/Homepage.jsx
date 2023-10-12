import React, { useEffect, useState } from 'react';
import './homepage.css';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { getDocs, collection } from 'firebase/firestore'




const Homepage = ({setAuthenticationStatus}) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const usersCollectionRef = collection(db, "users");
  const [refreshKey, setRefreshKey] = useState(0);


  // Reading survey data and user data from the database
  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await getDocs(usersCollectionRef);
        const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}))
        const names = filteredData.map((obj) => obj.name);
        setUsers(names)
      } catch(err) {
        console.log(err);
      }
    }
    getUsers();
  }, [])

  // Function that logs a user out and sends them to the login screen
  const logout = async () => {
    try {
      await signOut(auth);
      setAuthenticationStatus(false);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  
  return (
    <div className="dashboard-container">
      Welcome to the homepage
    </div>
  );
  
};

export default Homepage;