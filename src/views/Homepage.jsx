import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { getDocs, collection } from 'firebase/firestore'
import hoopEasyLogo from '../images/hoop-easy.png';
import addButton from '../images/add.png'
import profileImg from '../images/icons8-male-user-48.png'
import missingImage from '../images/missingImage.jpg'
import {TiChevronLeftOutline, TiChevronRightOutline} from 'https://cdn.skypack.dev/react-icons/ti';
import './homepage.css';




const Homepage = ({setAuthenticationStatus}) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const usersCollectionRef = collection(db, "users");
    //const [refreshKey, setRefreshKey] = useState(0);


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

                <div id='profile-button'><img src={profileImg} alt='Profile Icon' /></div>
            </div>
          </header>
        );
    }

    // A function I created to make grid placement easy and fun!
    // Very similar structure to a method I used to use in my early CS courses.
    // Due to its familiarity, I am utilizing it to let the user choose the starting and ending columns and rows
    // So that it automatically calculated how much the rows and columns should span with some 
    // Extra styling
    function setGridStyle( startCol, startRow, endCol, endRow, color, fontSize, border ) {
        let columnDifference = endCol - startCol;
        let rowDifference = endRow - startRow;
        
        if (columnDifference < 0) {
            columnDifference = 0;
        }
        
        if (rowDifference < 0) {
            rowDifference = 0;
        }
        
        const spanColumn = `span ${columnDifference}`;
        const spanRow = `span ${rowDifference}`;
        
        const style = {
            gridColumnStart: String(startCol),
            gridRowStart: String(startRow),
            gridColumnEnd: spanColumn,
            gridRowEnd: spanRow,
        };
        
        if (color) {
            style.backgroundColor = color;
        } else {
            style.backgroundColor = 'none';
        }

        if (fontSize) {
                style.fontSize = fontSize
        } 

        if (border) {
                style.border = '1px solid white'
        }

        style.margin = '0'
        style.textAlign = 'center'
        style.textDecoration = 'none'

        return style;
    }

    /* Sticky buttons with Player Overall and New Game */
    const PlayerRating = () => {
        const flexCol = {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'center',
        };
      
        const flexRow = {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'flex-end', // Use flex-end to align items at the end
          width: '100%',
        };
      
        const card = {
          position: 'fixed', // Change to 'fixed' if you want it relative to the viewport
          width: '125px',
          height: '125px',
          backgroundColor: 'black',
          border: '1px solid white',
          bottom: '0',
          left: '0',
          marginLeft: '25px',
          marginBottom: '25px',
        };
      
        const ratingFont = {
          fontSize: '65px',
        };
      
        const subtextFont = { fontSize: '12px' };
      
        return (
          <div style={{ ...flexCol, ...card }}>
            <div>Current Rating</div>
            <div style={flexRow}>
              <span style={ratingFont}>67</span>
              <span style={subtextFont}>OVR</span>
            </div>
          </div>
        );
    };
    const CreateGame = () => {
        const flexCol = {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
        };
        
        
        const card = {
            position: 'fixed',
            width: '125px',
            height: '125px',
            backgroundColor: 'black',
            border: '1px solid white',
            bottom: '0',
            right: '0',
            marginRight: '25px',
            marginBottom: '25px',
        };
        
          return (
            <div style={{ ...flexCol, ...card }}>
              <img src={addButton} alt='Add button' style={{ width: '50px'}}/>
              <div>NEW GAME</div>
            </div>
          );
    }

    /* Section pages */
    const Welcome = () => {
        const gridStyle = {
          display: 'grid',
          gridTemplateColumns: 'repeat(13, 1fr)',
          gridTemplateRows: 'repeat(30, 1fr)',
          gap: '10px',
        };
      
        const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
        const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);
        const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
        const historyStyle = setGridStyle(2, 17, 5, 22, undefined, "25px", true);
        const gameStyle = setGridStyle(6, 17, 9, 22, undefined, "25px", true);
        const ratingsStyle = setGridStyle(10, 17, 13, 22, undefined, "25px", true);
      
        const linkStyle = {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        };
      
        return (
          <section id="welcome">
            <div id="welcome-container" style={gridStyle}>
              <h1 style={h1Style}>Welcome</h1>
              <div style={horizontalLine}></div>
              <p style={paragraph}>
                It’s good to see you again. Here you’ll find everything you need to keep hooping easy.
              </p>
      
              <a style={{ ...linkStyle, ...historyStyle }} href="#history">My history</a>
              <a style={{ ...linkStyle, ...gameStyle }} href="#find-game">Find a game</a>
              <a style={{ ...linkStyle, ...ratingsStyle }} href="#ratings">My ratings</a>

            </div>
          </section>
        );
    };

    const History = () => {
        const gridStyle = {
                display: 'grid',
                gridTemplateColumns: 'repeat(13, 1fr)',
                gridTemplateRows: 'repeat(30, 1fr)',
                gap: '10px',
        };

        const tableHeaderStyle = {
            textAlign: 'center',
            fontSize: '25px'
        };
        
        const tableCellStyle = {
            border: '1px solid rgba(255, 255, 255, 0.5)'
        };

        const data = [
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 1', result: '2' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 2', result: '-0.5' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 3', result: '1' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 4', result: '-2' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 5', result: '3' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '1' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
            { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },

        ];

        const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
        const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);
        const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
        const tableGrid = setGridStyle(3, 10, 12, 30, undefined, undefined, true)

        return (
            <section id="history">
              <div id="history-container" style={gridStyle}>
                <h1 style={h1Style}>Your history</h1>
                <div style={horizontalLine}></div>
                <p style={paragraph}>See how previous games stack up.</p>

                <div style={{ ...tableGrid, overflow: 'auto' }}> 
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead style={tableHeaderStyle}>
                      <tr>
                        <th style={{ ...tableCellStyle, height: '50px' }}>When</th>
                        <th style={ tableCellStyle }>Who</th>
                        <th style={ tableCellStyle }>Where</th>
                        <th style={ tableCellStyle }>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, index) => ( 
                        <tr key={index} style={{ border: '1px solid white' }}>
                            <td style={index === 0 ? { ...tableCellStyle, borderTop: '1px solid white' } : tableCellStyle}>
                             {row.when}
                            </td>
                            <td style={{ ...tableCellStyle, height: '50px' }}>{row.who}</td>
                            <td style={tableCellStyle}>{row.where}</td>
                            <td style={{
                                ...tableCellStyle,
                                color: parseFloat(row.result) > 0 ? 'green' : 'red',
                                fontSize: '20px'
                                }}>
                                {row.result}
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );          
    }

    const FindGames = () => {
                    
        const fakeData = [
            { 
                date: '11.10', 
                profile: '',
                name: 'Paul 0',
                height: '6\'4',
                ovr: '67',
                age: '21',
                location: 'Cone Fieldhouse',
                city: 'Salem, OR'
            }, 
            { 
                date: '11.10', 
                profile: '',
                name: 'Paul 1',
                height: '6\'4',
                ovr: '67',
                age: '21',
                location: 'Cone Fieldhouse',
                city: 'Salem, OR'
            },
            { 
                date: '11.10', 
                profile: '',
                name: 'Paul 2',
                height: '6\'4',
                ovr: '67',
                age: '21',
                location: 'Cone Fieldhouse',
                city: 'Salem, OR'
            },
            { 
                date: '11.10', 
                profile: '',
                name: 'Paul 3',
                height: '6\'4',
                ovr: '67',
                age: '21',
                location: 'Cone Fieldhouse',
                city: 'Salem, OR'
            },
            { 
                date: '11.10', 
                profile: '',
                name: 'Paul 4',
                height: '6\'4',
                ovr: '67',
                age: '21',
                location: 'Cone Fieldhouse',
                city: 'Salem, OR'
            }

        ]
        const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
        const horizontalLine = setGridStyle(6, 4, 9, 6, "#da3c28", undefined, false);
        const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
        const carouselLocation = setGridStyle(6, 10, 11, 56, undefined, undefined, undefined)

        const gridStyle = {
            display: 'grid',
            gridTemplateColumns: 'repeat(13, 1fr)',
            gridTemplateRows: 'repeat(60, 1fr)',
            gap: '10px',
        };
        const flexboxRow = {
            display: 'flex',
            flexDirection: 'space-around',
            alignItems: 'center',
            gap: '10px',
        }
        const buttonStyle = {
            height: '35px',
            width: '150px',
            border: '2px solid green',
            borderRadius: '10px',
            margin: '0 auto'
        }
        const center = {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }     

        // Carousel credit to: https://codepen.io/ykadosh/pen/ZEJLapj by Yoav Kadosh
        const Carousel = ({children}) => {
            const [active, setActive] = useState(0);
            const count = React.Children.count(children);
            
            return (
              <div className='carousel' style={{...carouselLocation, ...flexboxRow}}>
                {active > 0 && 
                    <button className='nav left' onClick={() => setActive(i => i - 1)}>
                        <TiChevronLeftOutline/>
                    </button>
                }
                {React.Children.map(children, (child, i) => (
                  <div className='card-container' style={{
                      '--active': i === active ? 1 : 0,
                      '--offset': (active - i) / 3,
                      '--direction': Math.sign(active - i),
                      '--abs-offset': Math.abs(active - i) / 3,
                      'pointer-events': active === i ? 'auto' : 'none',
                      'opacity': Math.abs(active - i) >= 3 ? '0' : '1',
                      'display': Math.abs(active - i) > 3 ? 'none' : 'block',
                    }}>
                    {child}
                  </div>
                ))}
                {active < count - 1 && 
                    <button className='nav right' onClick={() => setActive(i => i + 1)}>
                        <TiChevronRightOutline/>
                    </button>
                }
              </div>
            );
        };

        const Card = ({ currentCard }) => (
            <div className='card'>
                    <div style={{display: "flex", justifyContent:'space-between'}}>
                        <div>1v1</div>
                        <div>
                            <div>{currentCard.date}</div>
                            <div>TIME</div>
                        </div>
                    </div>
                    <div style={{alignItems: 'center'}}>
                        <img src={missingImage} alt={'Profile img'}></img>
                    </div>
                    <div style={{fontSize: '1.5em'}}>
                        {currentCard.name}
                    </div>
                    <div style={{display: "flex", justifyContent:'space-around'}}>
                        <div>{currentCard.height}</div>
                        <div>{currentCard.ovr} ovr</div>
                        <div>{currentCard.age} yrs</div>
                    </div>
                    <div>
                        {currentCard.location}
                    </div>
                    <div className='cursor' style={{ ...buttonStyle, ...center }}>
                        accept
                    </div>
            </div>
        );

        return (
            <section id="find-game" style={gridStyle}>
                <h1 style={h1Style}>Find a game</h1>
                <div style={horizontalLine}></div>
                <p style={paragraph}></p>
                <div style={{ ...carouselLocation, ...flexboxRow }}>

                    <Carousel>
                    {fakeData.map((_, i) => (
                        <Card currentCard={fakeData[i]}/>
                    ))}
                    </Carousel>

                </div>
            </section>
        )


/*
return (
<section id="find-game" style={gridStyle}>
    <h1 style={h1Style}>Find a game</h1>
    <div style={horizontalLine}></div>
    <p style={paragraph}>
    Browse games, discover local courts, and connect with other hoopers instantly.
    </p>

    <button onClick={prevCard} style={buttonPrevLocation}>Previous</button>

    <div style={{ ...carouselLocation, ...flexboxRow }}>
    {getVisibleIndices(currentIndex, fakeData.length).map(index => {
        const item = fakeData[index];
        return (
        <div style={cardStyle} key={index}>
            <h2>{item.name}</h2>
            <p>{item.height}</p>
            <p>{item.ovr}</p>
            <p>{item.age}</p>
            <p>{item.location}</p>
            <p>{item.city}</p>
        </div>
        );
    })}
    </div>
    <button onClick={nextCard} style={buttonNextLocation}>Next</button>
</section>
);
*/ 

/*
      return (
        <section id="find-game">
          <div id="welcome-container" style={gridStyle}>
            <h1 style={h1Style}>Find a game</h1>
            <div style={horizontalLine}></div>
            <p style={paragraph}>
              Browse games, discover local courts, and connect with other hoopers instantly.
            </p>

            <button onClick={prevCard} style={buttonPrevLocation}>Previous</button>

            <div style={{ ...carouselLocation, ...flexboxRow }}>

                <div style={{...cardStyle, ...previousStyling }}>
                    
                    <div>{fakeData[getPrevCardIndex()].name}</div>

                </div>

                <div style={{...cardStyle, ...currentStyling}}>
                    
                    <div style={{display: "flex", justifyContent:'space-between'}}>
                        <div>1v1</div>
                        <div>
                            <div>{fakeData[currentIndex].date}</div>
                            
                            <div>TIME</div>
                        </div>
                    </div>

                    <div>
                        <img src={missingImage} alt={'Profile img'}></img>
                    </div>

                    <div style={{fontSize: '1.5em'}}>
                        {fakeData[currentIndex].name}
                    </div>

                    <div style={{display: "flex", justifyContent:'space-around'}}>
                        <div>{fakeData[currentIndex].height}</div>
                        <div>{fakeData[currentIndex].ovr} ovr</div>
                        <div>{fakeData[currentIndex].age} yrs</div>
                    </div>

                    <div>
                        {fakeData[currentIndex].location}
                    </div>

                    <div className='cursor' style={{ ...buttonStyle, ...center }}>
                        accept
                    </div>
                    

                </div>

                <div style={{...cardStyle, ...nextStyling}}>

                    <div>
                        <img src={missingImage} alt={'Profile img'}></img>
                    </div>
                    <div>{fakeData[getNextCardIndex()].name}</div>

                </div>
              
            </div>
            <button onClick={nextCard} style={buttonNextLocation}>Next</button>

          </div>
        </section>
      );
*/
    };      
      
      
      

  
  return (
    <div className="dashboard-container">

        <PlayerRating />
        <CreateGame />

        <Navbar />
        <Welcome />
        <History />

        <FindGames />

        <section id='ratings'>
                ratings
        </section>
    </div>
  );
  
};

export default Homepage;