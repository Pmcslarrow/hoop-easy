import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { getDocs, collection, query, where } from 'firebase/firestore'
import hoopEasyLogo from '../images/hoop-easy.png';
import addButton from '../images/add.png'
import profileImg from '../images/icons8-male-user-48.png'
import missingImage from '../images/missingImage.jpg'
import {TiChevronLeftOutline, TiChevronRightOutline} from 'https://cdn.skypack.dev/react-icons/ti';
import './homepage.css';




const Homepage = ({setAuthenticationStatus}) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [currentUserID, setCurrentUserID] = useState([])
    const [availableGames, setAvailableGames] = useState([])
    const [isCreateGameActive, setCreateGameActive] = useState(false)
    const usersCollectionRef = collection(db, "users");
    const gamesCollectionRef = collection(db, 'Games')

    // Reading user data from the database
    useEffect(() => {
        const getUsers = async () => {
            try {
                const data = await getDocs(usersCollectionRef);
                const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}))
                // const names = filteredData.map((obj) => obj.username);
                setUsers(filteredData)
            } catch(err) {
                console.log(err);
            }
        }
        const getCurrentUser = async () => {
            const data = await getDocs(usersCollectionRef);
            const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}))
            filteredData.map((obj) => {
                if ( obj?.email === auth?.currentUser?.email ) {
                    setCurrentUserID(obj.id)
                }
            })
        }
        const getAvailableGames = async () => {
            try {
                const games = await getDocs(gamesCollectionRef);
                const filteredGames = games.docs.map((doc) => ({...doc.data(), id: doc.id}))
                let joinedGames = filteredGames.map(game => {
                    let user = users.find(user => user.id === game.playerID);
                    if (user) {
                        return {
                           ...game,
                           ...user
                        };
                    }
                    return game;
                });

                setAvailableGames(joinedGames)
            } catch(err) {
                console.log(err);
            }
        }

    getUsers();
    getCurrentUser();
    getAvailableGames();
    }, [])


    /* GLOBAL FUNCTIONS */

    function toggleCreateGame() {
        setCreateGameActive(!isCreateGameActive)
    }
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


    /* COMPONENTS */

    const CreateGameForm = () => {
        const [isVisible, setIsVisible] = useState(false);
       
        useEffect(() => {
          setIsVisible(true);
        }, []);

        const handleSubmit = (event) => {
            event.preventDefault();
          
            const formData = {
              streetAddress: document.getElementById('streetAddress').value,
              city: document.getElementById('city').value,
              state: document.getElementById('state').value,
              zipcode: document.getElementById('zipcode').value,
              dateOfGame: document.getElementById('dateOfGame').value,
              timeOfGame: document.getElementById('timeOfGame').value,
            };
            
            toggleCreateGame()
            handleCreateGame(formData);
        };          

        // Handles the form to create a new game
        // Iterates through the users until it finds the player that accepted the game, and the opponent
        // It then adds a new document into each player's confirmedGames/ collection containing info like location and time
        const handleCreateGame = async () => {
            console.log("Paul work here next")
            let userLoggedIn = auth?.currentUser;
            let opponentEmail = 'jacboyd7@gmail.com'
            if (userLoggedIn) {
                const userCollection = await getDocs(usersCollectionRef);
                userCollection.forEach(async (doc) => {
                    const currentPlayerData = doc.data();
                    const currentPlayerEmail = currentPlayerData?.email;
                    const currentPlayerDocumentID = doc.id;
                    const confirmedGamesPath = `users/${currentPlayerDocumentID}/confirmedGames`;
                    const confirmedGamesCollectionRef = collection(db, confirmedGamesPath);

                    if ( currentPlayerEmail === userLoggedIn?.email || currentPlayerEmail === opponentEmail ) {
                        const userLoggedInConfirmedGamesSnapshot = await getDocs(confirmedGamesCollectionRef);
                        const userLoggedInConfirmedGames = userLoggedInConfirmedGamesSnapshot.docs.map(doc => doc.data());
                        
                        // Add the form data of the new games right here into both the player and opponent's account
                    } 
                });

                // Send the player and opponent an email confirming the game

                // Remove the game from the Games/ collection
            } else {
                console.log("No user signed in");
            }
        };
       
        const styling = {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            height: '60%',
            width: '40%',
            borderRadius: '30px',
            backgroundColor: 'black',
            border: '1px solid white',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.35s ease-in-out, transform 0.25s ease-in',
            padding: '50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        };
        const inputStyle = {
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            fontSize: '16px',
            marginBottom: '10px', 
        };
        const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
       
        return (
            <form style={styling} onSubmit={handleSubmit}>
              <label htmlFor="streetAddress">Street Address:</label>
              <input style={{...inputStyle, width: '50%'}} id="streetAddress" placeholder="Street Address" required/>
              <label htmlFor="city">City:</label>
              <input style={{...inputStyle, width: '50%'}} id="city" placeholder="City" required/>
              <label htmlFor="state">State:</label>
                <select style={{...inputStyle, width: '50%'}} id="state" required>
                {states.map((state) => (
                    <option key={state} value={state}>
                    {state}
                    </option>
                ))}
                </select>
              <label htmlFor="zipcode">Zipcode:</label>
              <input style={{...inputStyle, width: '50%'}} id="zipcode" placeholder="Zipcode" required/>
              <label htmlFor="dateOfGame">Date of game:</label>
              <input style={{...inputStyle, width: '50%'}} id="dateOfGame" placeholder="Date of game" type="date" required/>
              <label htmlFor="timeOfGame">Time of game:</label>
              <input style={{...inputStyle, width: '50%'}} id="timeOfGame" placeholder="Time of game" type="time" required/>
              <button style={{ width: '50%', padding: '20px', fontSize: '16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Create</button>
            </form>
        );
    };
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
    const CreateGameButton = () => {
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
        <div id='new-game' style={{ ...flexCol, ...card }}  onClick={toggleCreateGame}>
            <img src={addButton} alt='Add button' style={{ width: '50px'}}/>
            <div>NEW GAME</div>
        </div>
        );
    }
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

        const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
        const horizontalLine = setGridStyle(6, 4, 9, 6, "#da3c28", undefined, false);
        const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
        const carouselLocation = setGridStyle(6, 5, 11, 52, undefined, undefined, undefined)

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
                        <div>{currentCard.gameType}v{currentCard.gameType}</div>
                        <div>
                            <div>{currentCard.dateOfGame}</div>
                            <div>{currentCard.time}</div>
                        </div>
                    </div>
                    <div style={{alignItems: 'center'}}>
                        <img src={missingImage} alt={'Profile img'}></img>
                    </div>
                    <div style={{fontSize: '1.5em'}}>
                        {currentCard.username}
                    </div>
                    <div style={{display: "flex", justifyContent:'space-around'}}>
                        <div>{currentCard.heightFt}'{currentCard.heightInches}"</div>
                        <div>{currentCard.overall} ovr</div>
                    </div>
                    <div>
                        {currentCard.addressString}
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
                    {availableGames.map((_, i) => (
                        <Card currentCard={availableGames[i]}/>
                    ))}
                    </Carousel>

                </div>
            </section>
        )
    };      
    const RatingsSection = () => {
        return (
            <section id='ratings'>
                ratings
            </section>
        )
    }
      
  return (
    <div className="dashboard-container">

        { isCreateGameActive && <CreateGameForm />}

        <PlayerRating />
        <CreateGameButton />

        <Navbar />
        <Welcome />
        <History />

        <FindGames />

        <RatingsSection />
    </div>
  );
  
};

export default Homepage;