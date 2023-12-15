import React from 'react';
import hoopEasyLogo from '../../images/hoop-easy.png';
import profileImg from '../../images/icons8-male-user-48.png'
import { useNavigate } from 'react-router-dom';


const Navbar = (props) => {
    const navigate = useNavigate()
    const { setAuthenticationStatus, searchBar } = props

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

    return (
      <header>
        <img src={hoopEasyLogo} alt="Logo" className='profile-button' style={{width: '200px', height: '100px', marginLeft: '10px'}} onClick={navigateHome} />

        <div className='flexbox-row'>
            { searchBar === true && <SearchBar />}
            
            <div className='profile-button'>
                <img src={profileImg} alt='Profile Icon' onClick={navigateProfile}/>
            </div>
        </div>
      </header>
    );
}

export { Navbar }