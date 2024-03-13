import React, { useEffect, useState } from 'react';
import setGridStyle from '../../utils/setGridStyle';
import { useNavigate } from 'react-router-dom';
import StepsImage from '../../assets/images/steps.png'
import '../../assets/styling/welcome.css'

const Welcome = () => {
    const navigate = useNavigate()
        
    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);    
   
    const node_1_position = setGridStyle(3, 8, 4, 8, "#da3c28", "4vw", false)
    const node_2_position = setGridStyle(5, 8, 6, 8, "#da3c28", "4vw", false)
    const node_3_position = setGridStyle(7, 8, 8, 8, "#da3c28", "4vw", false)
    const node_4_position = setGridStyle(9, 8, 10, 8, "#da3c28", "4vw", false)
    const node_5_position = setGridStyle(11, 8, 12, 8, "#da3c28", "4vw", false)

    const node_1_subtext = setGridStyle(3, 10, 4, 10, undefined, "16px", false)
    const node_2_subtext = setGridStyle(5, 10, 6, 10, undefined, "16px", false)
    const node_3_subtext = setGridStyle(7, 10, 8, 10, undefined, "16px", false)
    const node_4_subtext = setGridStyle(9, 10, 10, 10, undefined, "16px", false)
    const node_5_subtext = setGridStyle(11, 10, 12, 10, undefined, "16px", false)
    const [display, setDisplayNone] = useState(true)

    useEffect(() => {
        window.addEventListener("resize", handleResize, false);
    }, [])

    const handleResize = () => {
        if ( window.innerWidth < 950 ) {
            setDisplayNone(false)
        } else {
            setDisplayNone(true)
        }
    }

    const gridStyle = {
        display: display === false ? 'none' : 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(30, 1fr)',
        gap: '10px',
      };
  
    const linkStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        borderRadius: '50%',
        width: '100px',
        height: '100px' 
    };

    const navigateFindGame = () => {
        navigate('/findGame')
    }

    const navigateRankings = () => {
        navigate('/rankings')
    }

    function WelcomeContainer() {
        return (
            <div id="welcome-container" style={gridStyle}>
                <h1 style={h1Style}>How to play</h1>
                <div style={horizontalLine}></div>
                <a className="stepNodes" style={{...node_1_position, ...linkStyle}} onClick={navigateFindGame}>1</a>
                    <p style={{...node_1_subtext}}>Create a game or find and join a game</p>
        
                <a className="stepNodes" style={{...node_2_position, ...linkStyle}} href='#my-games'>2</a>
                    <p style={{...node_2_subtext}}>Meet up and hoop</p>
        
                <a className="stepNodes" style={{...node_3_position, ...linkStyle}} href='#my-games'>3</a>
                    <p style={{...node_3_subtext}}>Submit results and select captains</p>
        
        
                <a className="stepNodes" style={{...node_4_position, ...linkStyle}} href='#my-games'>4</a>
                    <p style={{...node_4_subtext}}>Captains accept or deny the scores</p>
        
        
                <a className="stepNodes" style={{...node_5_position, ...linkStyle}} onClick={navigateRankings}>5</a>
                    <p style={{...node_5_subtext}}>Win to rank up!</p>
            </div>
        )
    }
  
    return (
        <div>
            {display ? 
                <section id="welcome">
                    <WelcomeContainer />
                </section>
                :
                null
            }
        </div>
        
    );    
};

export { Welcome }