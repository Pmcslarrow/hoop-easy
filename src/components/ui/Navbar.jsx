import React from 'react';
import hoopEasyLogo from '../../assets/images/hoop-easy.png';
import profileImg from '../../assets/images/icons8-male-user-48.png'
import navButtonImg from '../../assets/images/269dd16fa1f5ff51accd09e7e1602267.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';

import "../../assets/styling/navbar.css"


const Navbar = (props) => {
    const navigate = useNavigate()
    const { setAuthenticationStatus, searchBar, profilePic } = props
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    if (isSidebarOpen) {
        document.body.classList.add('disable-scrolling');
    } else {
        if (document.body.classList.contains('disable-scrolling')) {
            document.body.classList.remove('disable-scrolling');
        }
    }
    
    
    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const navigateProfile = () => {
        navigate('/profile')
    }

    const SearchBar = () => {
        return (
            <div className="search-container">
                    <form className="no-submit">
                            <input id='search-bar' type="search" placeholder="Search rankings..." />
                    </form>
            </div>
        )
    }

    // If the user is not in the profile page, we want the click of the Logo to go back to the CreateAccount home screen. 
    // If the user is inside of the profile page, we want the click of the Logo to go back to the Homepage (keeps the user logged in)
    const navigateHome = () => {
        if ( searchBar === true ) {
            setAuthenticationStatus(false)
            navigate("/")
        } else {
            navigate("/homepage")
        }
        
    }

    const navigateRankings = () => {
        navigate('/rankings')
    }

    const navigateFindGame = () => {
        navigate('/findGame')
    }

    return (
      <>
      <header>
        <img src={hoopEasyLogo} alt="Logo" className='profile-button' style={{width: '200px', height: '100px', marginLeft: '10px'}} onClick={navigateHome} />

        <div className='flexbox-row'>
            { searchBar === true && <SearchBar />}

            { profilePic === true && 
                <div className='profile-button'>
                    <img src={profileImg} alt='Profile Icon' onClick={navigateProfile}/>
                </div>
            }

            <div className="logo">
                <img src={navButtonImg} style={{"width": "50px"}} onClick={toggleSidebar} id='drop-down' alt="Navigation button (three lines)" />
            </div>
            
        </div>
      </header>

      <AnimatePresence className='outer-nav'>
          {isSidebarOpen && (
            <motion.div
              className="sidebar"
              initial={{ width: '100%', height: '0%', zIndex: 2  }} 
              animate={{ width: '100%', height: '88%', zIndex: 2 }} 
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
                <a href="#" className="sidebar-link" onClick={navigateRankings}>Rankings</a>
                <a href="#" className="sidebar-link" onClick={navigateFindGame}>FIND A GAME</a>
                <a href="#" className="sidebar-link">HELP</a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
}

export { Navbar }