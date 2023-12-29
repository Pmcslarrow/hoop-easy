import React from 'react';
import setGridStyle from '../../utils/setGridStyle';

const Welcome = () => {
        
    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);
    const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
    
    const myGamesStyle = setGridStyle(4, 11, 7, 16, undefined, "25px", true)
    const findGamesStyle = setGridStyle(8, 11, 11, 16, undefined, "25px", true);
    
    const historyStyle = setGridStyle(4, 18, 7, 23, undefined, "25px", true);
    const ratingsStyle = setGridStyle(8, 18, 11, 23, undefined, "25px", true);

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(30, 1fr)',
        gap: '10px',
      };
  
    const linkStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      borderRadius: '15px'
    };
  
    return (
      <section id="welcome">
        <div id="welcome-container" style={gridStyle}>
          <h1 style={h1Style}>Welcome</h1>
          <div style={horizontalLine}></div>
          <p style={paragraph} className='hide'>
            Here you’ll find everything you need to keep hooping easy.
          </p>

            <a style={{ ...linkStyle, ...myGamesStyle }} href="#my-games">My games</a>
            <a style={{ ...linkStyle, ...findGamesStyle }} href="#find-game">Find a game</a>
            <a style={{ ...linkStyle, ...historyStyle }} href="#history">My history</a>
            <a style={{ ...linkStyle, ...ratingsStyle }} href="#ratings">My ratings</a>

        </div>
      </section>
    );
};

export { Welcome }