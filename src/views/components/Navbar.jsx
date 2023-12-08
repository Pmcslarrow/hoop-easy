import React from 'react';
import hoopEasyLogo from '../../images/hoop-easy.png';
import profileImg from '../../images/icons8-male-user-48.png'


const Navbar = () => {
    return (
      <header>
        <img src={hoopEasyLogo} alt="Logo" />

        <div className='flexbox-row'>
            <div className="search-container">
                    <form className="no-submit">
                            <input id='search-bar' type="search" placeholder="Search rankings..." />
                    </form>
            </div>

            <div id='profile-button'>
                <img src={profileImg} alt='Profile Icon'/>
            </div>
        </div>
      </header>
    );
}

export { Navbar }