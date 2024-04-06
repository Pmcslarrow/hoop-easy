import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../../assets/styling/welcome.css'

const Welcome = () => {
    const navigate = useNavigate()

    const navigateFindGame = () => {
        navigate('/findGame')
    }

    const navigateRankings = () => {
        navigate('/rankings')
    }

    const CircleButton = ({ text, func }) => {
        const circleStyling = {
            width: '12vw',
            height: '12vw',
            padding: '10px',
            backgroundColor: 'var(--background-dark-orange)',
            borderRadius: '50%',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }

        return (
            <a href="#my-games" style={{color: 'white', textDecoration: 'none'}}>
                <div style={circleStyling} className='how-to-circle' onClick={func ? func : null}>
                    {text}
                </div>
            </a>
            
        )
    }

    const WelcomeContainer = () => {
        return (
            <div>
                <h1 style={{fontSize: '8vw'}}>How To Play</h1>
                <div id='circle-button-wrapper' style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: '15px'}}>
                    <CircleButton text="Create a game or find and join a game" func={navigateFindGame} />
                    <CircleButton text="Meet up and hoop" func={null}/>
                    <CircleButton text="Submit results and select captains" func={null}/>
                    <CircleButton text="Captains accept or deny the scores" func={null}/>
                    <CircleButton text="Win to rank up!" func={navigateRankings}/>
                </div>
            </div>
        )
    }
  
    return (
        <section id="welcome">
            <WelcomeContainer />
        </section> 
    );    
};

export { Welcome }