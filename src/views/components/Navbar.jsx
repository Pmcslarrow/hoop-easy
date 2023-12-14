import React from 'react';
import hoopEasyLogo from '../../images/hoop-easy.png';
import profileImg from '../../images/icons8-male-user-48.png'
import { useNavigate } from 'react-router-dom';


const Navbar = (props) => {
    const navigate = useNavigate()
    const { searchBar } = props

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

    const navigateHome = () => {
        navigate("/")
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