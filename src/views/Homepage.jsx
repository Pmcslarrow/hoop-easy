import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { getDocs, addDoc, collection, GeoPoint, deleteDoc, getDoc, doc, updateDoc } from 'firebase/firestore'
import hoopEasyLogo from '../images/hoop-easy.png';
import addButton from '../images/add.png'
import profileImg from '../images/icons8-male-user-48.png'
import missingImage from '../images/missingImage.jpg'
import axios from 'axios';
import './homepage.css';




const Homepage = ({setAuthenticationStatus}) => {
    // State variables
    const [users, setUsers] = useState([]);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [currentUsername, setCurrentUsername] = useState('')
    const [currentUser, setCurrentUser] = useState({})
    const [availableGames, setAvailableGames] = useState([]);
    const [myPendingGames, setMyPendingGames] = useState([]);
    const [myConfirmedGames, setMyConfirmedGames] = useState([]);
    const [isCreateGameActive, setCreateGameActive] = useState(false);
    const [isScoreSubmitting, setIsScoreSubmitting] = useState(false)

    // Firestore collection references
    const usersCollectionRef = collection(db, "users");
    const gamesCollectionRef = collection(db, 'Games');
    const [myConfirmedGamesRef, setMyConfirmedGamesRef] = useState('');
    const [myPendingGamesRef, setMyPendingGamesRef] = useState('');

    // Navigation
    const navigate = useNavigate();

    // Loading
    const [refreshToken, setRefreshToken] = useState(0)
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersData = await getDocs(usersCollectionRef);
                const filteredUsersData = usersData.docs.map((doc) => ({...doc.data(), id: doc.id}));
                setUsers(filteredUsersData);
     
                const currentUser = filteredUsersData.find((user) => user.email === auth?.currentUser?.email);
                if (currentUser) {
                    setCurrentUserID(currentUser.id);
                    setCurrentUsername(currentUser.username)
                    setCurrentUser(currentUser)
                    setMyConfirmedGamesRef(`users/${currentUser.id}/confirmedGames`);
                    setMyPendingGamesRef(`users/${currentUser.id}/pendingGames`);
                 
                    const fetchAndMapData = async (path) => {
                        const collectionRef = collection(db, path);
                        const docs = await getDocs(collectionRef);
                        return docs.docs.map((doc) => ({...doc.data(), id: doc.id}));
                    }
                 
                    const confirmedGames = await fetchAndMapData(`users/${currentUser.id}/confirmedGames`);
                    const pendingGames = await fetchAndMapData(`users/${currentUser.id}/pendingGames`);
                 
                    setMyConfirmedGames(confirmedGames);
                    setMyPendingGames(pendingGames);
                }
                 
                const gamesData = await getDocs(gamesCollectionRef);
                const filteredGamesData = gamesData.docs.map((doc) => ({...doc.data(), id: doc.id}));
                let joinedGames = filteredGamesData.map(game => {
                    let user = filteredUsersData.find(user => user.id === game.playerID);
                    if (user && user.email !== auth?.currentUser?.email) {
                       return {
                           ...game,
                           ...user
                       }
                    }
                    return null
                }).filter(game => game !== null);
     
                setAvailableGames(joinedGames);
     
                setLoading(false);
            } catch(err) {
                console.log(err);
            }
        }
     
        fetchData();
     }, [refreshToken]);
     

    if (isLoading) {
        return <div>Loading...</div>;
    }


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
        const [formData, setFormData] = useState({
            streetAddress: '',
            city: '',
            state: '',
            zipcode: '',
            dateOfGame: '',
            timeOfGame: '',
          });      

        useEffect(() => {
          setIsVisible(true);
        }, []);


        const handleFormChange = (event) => {
            const { id, value } = event.target;
            setFormData((prevData) => ({
              ...prevData,
              [id]: value,
            }));
        };
        const handleNewGameSubmission = async (event) => {
            event.preventDefault();  
            const dateTimeString = `${formData.dateOfGame} ${formData.timeOfGame}`;
            const dateTime = new Date(dateTimeString);
            let userLoggedIn = auth?.currentUser;

            if (userLoggedIn) {
                const userCollection = await getDocs(usersCollectionRef);
                userCollection.forEach(async (doc) => {
                    const currentPlayerData = doc.data();
                    const currentPlayerEmail = currentPlayerData?.email;
                    const currentPlayerDocumentID = doc.id;
                    const pendingGamesPath = `users/${currentPlayerDocumentID}/pendingGames`;
                    const pendingGamesCollectionRef = collection(db, pendingGamesPath);

                    if ( currentPlayerEmail === userLoggedIn?.email ) {   

                        fetchLocationCoordinates()
                            .then(({ longitude, latitude }) => {
                                addGameToPlayersConfirmedGames( longitude, latitude, gamesCollectionRef, pendingGamesCollectionRef, currentPlayerDocumentID )
                                toggleCreateGame()
                            })
                            .catch((error) => {
                                console.error(error.message);
                            });

                    }
                });

            } else {
                console.log("No user signed in");
            }
        };    
        const fetchLocationCoordinates = () => {
            const params = {
                street: formData.streetAddress,
                city: formData.city,
                state: formData.state,
                postalcode: formData.zipcode,
                country: 'US'
            };
            const API_START = 'https://geocode.maps.co/search'

        
            return axios.get(API_START, { params: params })
                .then((response) => {
                    const data = response.data;
        
                    if (data.length > 0) {
                        const coordinates = {
                            longitude: data[0].lon,
                            latitude: data[0].lat
                        };
                        return coordinates;
                    } else {
                        throw new Error('Could not find this address');
                    }
                })
                .catch((error) => {
                    console.error(error);
                    throw error; 
                });
        }
        const addGameToPlayersConfirmedGames = async ( longitude, latitude, gamesCollectionRef, pendingGamesCollectionRef, currentPlayerDocumentID ) => {

            const coordinates = new GeoPoint(Number(latitude), Number(longitude));
            const addressString = formData.streetAddress
            const dateOfGame = formData.dateOfGame
            const time = formData.timeOfGame
            const gameType = '1'
            const playerID = currentPlayerDocumentID

            const DATA_UPLOAD = {
                coordinates, 
                addressString, 
                dateOfGame, 
                time, 
                gameType, 
                playerID
            }

            try {
                await addDoc(gamesCollectionRef, DATA_UPLOAD);
                await addDoc(pendingGamesCollectionRef, DATA_UPLOAD)
                setRefreshToken(refreshToken + 1)
            } catch (error) {
                console.error("Error adding document: ", error);
            }
        }
    
        
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
            paddingTop: '100px',
            paddingBottom: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '999'
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
            <form style={styling} onSubmit={handleNewGameSubmission}>
              <label htmlFor="streetAddress">Street Address:</label>
                <input
                    style={{ ...inputStyle, width: '50%' }}
                    id="streetAddress"
                    placeholder="Street Address"
                    value={formData.streetAddress}
                    onChange={handleFormChange}
                    required
                />
              <label htmlFor="city">City:</label>
                <input
                    style={{ ...inputStyle, width: '50%' }}
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleFormChange}
                    required
                />
              <label htmlFor="state">State:</label>
                <select
                    style={{ ...inputStyle, width: '50%' }}
                    id="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    required
                >
                    {states.map((state) => (
                    <option value={state}>
                        {state}
                    </option>
                    ))}
                </select>
              <label htmlFor="zipcode">Zipcode:</label>
                <input
                    style={{ ...inputStyle, width: '50%' }}
                    id="zipcode"
                    placeholder="Zipcode"
                    value={formData.zipcode}
                    onChange={handleFormChange}
                    required
                />
              <label htmlFor="dateOfGame">Date of game:</label>
                <input
                    style={{ ...inputStyle, width: '50%' }}
                    id="dateOfGame"
                    placeholder="Date of game"
                    type="date"
                    value={formData.dateOfGame}
                    onChange={handleFormChange}
                    required
                />
              <label htmlFor="timeOfGame">Time of game:</label>
                <input
                    style={{ ...inputStyle, width: '50%' }}
                    id="timeOfGame"
                    placeholder="Time of game"
                    type="time"
                    value={formData.timeOfGame}
                    onChange={handleFormChange}
                    required
                />
              <button
                style={{
                  width: '50%',
                  padding: '20px',
                  fontSize: '16px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Create
              </button>
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
          alignItems: 'flex-end', 
          width: '100%',
        };
        const card = {
          position: 'fixed', 
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
      
              <a style={{ ...linkStyle, ...myGamesStyle }} href="#my-games">My games</a>
              <a style={{ ...linkStyle, ...findGamesStyle }} href="#find-game">Find a game</a>
              <a style={{ ...linkStyle, ...historyStyle }} href="#history">My history</a>
              <a style={{ ...linkStyle, ...ratingsStyle }} href="#ratings">My ratings</a>

            </div>
          </section>
        );
    };
    const MyGames = () => {
    
        const gridStyle = {
            display: 'grid',
            gridTemplateColumns: 'repeat(13, 1fr)',
            gridTemplateRows: 'repeat(30, 1fr)',
            gap: '10px',
        };

        const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
        const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);
        // const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
        const myGamesLocation = setGridStyle(2, 8, 12, 28, undefined, undefined, undefined)

        const ScoreSubmissionComponent = ({ currentCard }) => {
            const [scoreData, setScoreData] = useState({
              userScore: '',
              opponentScore: ''
            });

            useEffect(() => {
                console.log(currentCard)
                console.log(currentCard.gameApprovalStatus === true)
                console.log(!currentCard.gameApprovalStatus && (currentCard?.score?.playerScore || currentCard?.score?.opponentScore))
                console.log((!currentCard.gameApprovalStatus && !(currentCard?.score?.playerScore || currentCard?.score?.opponentScore)))
            }, [])


            const handleScoreChange = (event) => {
              const { id, value } = event.target;
              
              try {

                if ( value > 99 ) {
                    setScoreData((prevData) => ({
                        ...prevData,
                        [id]: 99,
                      }));
                      return
                } else {
                    setScoreData((prevData) => ({
                        ...prevData,
                        [id]: value,
                      }));
                }
              } catch (err) {
                console.log(err)
              }    

            };

            const handleScoreSubmission = async () => {
                const { userScore, opponentScore } = scoreData
                if ( !userScore || !opponentScore ) {
                    console.log("Please fill out the game info.")
                    return
                }

                const dataForCurrentPlayerCollection = {
                    ...currentCard,
                    playerID: currentUser.id,
                    score: {
                      playerScore: userScore,
                      opponentScore: opponentScore
                    },
                    gameApprovalStatus: true
                };

                const dataForOpponentCollection = {
                    ...currentCard,
                    opponentID: currentUser.id,
                    opponent: currentUser.username,
                    email: currentUser.email,
                    firstName: currentUser.firstName,
                    heightFt: currentUser.heightFt,
                    heightInches: currentUser.heightInches,
                    playerID: currentCard.playerID,
                    lastName: currentUser.lastName,
                    score: {
                     playerScore: opponentScore,
                     opponentScore: userScore
                    },
                    gameApprovalStatus: false
                };

                const playerDocID = currentCard.id;
                const playerDocRef = doc(db, `users/${currentUserID}/confirmedGames`, playerDocID);
                const opponentConfirmed = collection(db, `users/${currentCard.opponentID}/confirmedGames`);
                const opponentConfirmedSnapshot = await getDocs(opponentConfirmed);

                let opponentDoc = opponentConfirmedSnapshot.docs.find((doc) => {
                    const currDoc = doc.data();
                   
                    return currDoc.dateOfGame === currentCard.dateOfGame &&
                    currDoc.time === currentCard.time &&
                    currDoc.addressString === currentCard.addressString;
                });
                   
                
                if (opponentDoc) {
                    await updateDoc(opponentDoc.ref, dataForOpponentCollection);
                    await updateDoc(playerDocRef, dataForCurrentPlayerCollection);
                 } else {
                    console.log("Something went wrong while submitting the game")
                 }     
                 
                 setRefreshToken(refreshToken + 1)
                

                // 1) Set this player's gameApprovalPending status to true and add the score to their collection
                // 2) Set the opponent's gameApprovalPending status to false and add the score to their collection
                // 3) If the gameApprovalPending is true --> just return a pending ...
                // 4) If the gameApprovalPending is false AND the scores are there --> return Accept or Deny
                // 5) If the gameApprovalPending is false AND the the scores are NOT there --> Go through the same logic as now
            };

            const PendingComponent = () => {
                return <div>Waiting for opponent approval...</div>
            }
            const VerifyGameComponent = () => {
                const flexRow = {
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '5px'
                }
                return (
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '10px'}}>
                        <div style={flexRow}>
                            <div style={flexRow}>
                                <div>Your Score:</div>
                                <div>{currentCard.score.playerScore}</div>
                            </div>
                            <div style={flexRow}>
                                <div>Opponent score:</div>
                                <div>{currentCard.score.opponentScore}</div>
                            </div>
                        </div>
                        <div style={flexRow}>
                            <div id='accept-button'>Accept</div>
                            <div id='deny-button'>Deny</div>
                        </div>
                    </div>
                )
            }
            const ScoreInputComponent = () => {
                return (        
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px'}}>
                        <input
                            id='userScore'
                            type='number'
                            placeholder='Your score'
                            onChange={handleScoreChange}
                            value={scoreData.userScore}
                            min='0'
                            max='99'
                            className='placeholderStyle'
                            style={{width: '100%'}}
                        />
                        <input
                            id='opponentScore'
                            type='number'
                            placeholder='Opponent score'
                            onChange={handleScoreChange}
                            value={scoreData.opponentScore}
                            min='0'
                            max='99'
                            className='placeholderStyle'
                            style={{width: '100%'}}
                        />
                    </div>
                    <div>
                    <button onClick={handleScoreSubmission} style={{fontSize: '16px', height: '100%'}} id='submitScoreButton'>Submit Score</button>
                    </div>
                </>
                )
            }
          
            return (
                <>
                  {currentCard.gameApprovalStatus && <PendingComponent />}
                  {(!currentCard.gameApprovalStatus && (currentCard?.score?.playerScore || currentCard?.score?.opponentScore)) && <VerifyGameComponent />}
                  {(!currentCard.gameApprovalStatus && !(currentCard?.score?.playerScore || currentCard?.score?.opponentScore)) && <ScoreInputComponent />}
                </>
            );               
          };
          

        const PendingGameComponent = () => {
            <>
            <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
                <div>Pending</div>

                <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'end', gap: '5px'}}>
                    <div className='el'></div>
                    <div className='el'></div>
                    <div className='el'></div>
                </div>
            </div>
            
            </>
        }

        // This card is where you will have to check if the currentCard already has an attribute for the score of the game
        // If it does have the attribute, then you will have to show accept or deny. 
        const Card = ({ currentCard, type }) => (
            <li className='card' style={{padding: '20px'}}>
                    <div style={{display: "flex", justifyContent:'space-between'}}>
                        <div>{currentCard.gameType}v{currentCard.gameType}</div>
                        <div>
                            <div>{currentCard.dateOfGame}</div>
                            <div>Time: {currentCard.time}</div>
                        </div>
                    </div>
                    <div style={{alignItems: 'center'}}>
                        <img src={missingImage} alt={'Profile img'}></img>
                    </div>
                    <div>
                        Opponent: {currentCard?.opponent}
                    </div>
                    <div>
                        {currentCard.addressString}
                    </div>

                    {type === 'confirmed' ? (
                        <ScoreSubmissionComponent currentCard={currentCard}/>
                    ) : (
                        <PendingGameComponent />
                    )}
            </li>
        );
        

        return (
            <section id="my-games" style={gridStyle}>
                <h1 style={h1Style}>My Games</h1>
                <div style={horizontalLine}></div>

                <div id='myGames-container' style={myGamesLocation}>
                <ul className="cards" >
                    {myConfirmedGames.map((currentCard, i) => (
                        <Card key={`confirmed-${i}`} currentCard={currentCard} type='confirmed'/>  
                    ))}
                    {myPendingGames.map((currentCard, i) => (
                        <Card key={`pending-${i}`} currentCard={currentCard} type='pending' />  
                    ))}
                </ul>

                </div>
            </section>
        )
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
                        Left
                    </button>
                }
                {React.Children.map(children, (child, i) => (
                  <div className='card-container' style={{
                      '--active': i === active ? 1 : 0,
                      '--offset': (active - i) / 3,
                      '--direction': Math.sign(active - i),
                      '--abs-offset': Math.abs(active - i) / 3,
                      // 'pointer-events': active === i ? 'auto' : 'none',
                      'opacity': Math.abs(active - i) >= 3 ? '0' : '1',
                      'display': Math.abs(active - i) > 3 ? 'none' : 'block',
                    }}>
                    {child}
                  </div>
                ))}
                {active < count - 1 && 
                    <button className='nav right' onClick={() => setActive(i => i + 1)}>
                        Right
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
                    <div 
                        className='cursor' 
                        style={{ ...buttonStyle, ...center }} 
                        onClick={() => handleGameAcceptance(currentCard)} 
                    >
                    accept
                    </div>

            </div>
        );

        async function handleGameAcceptance ( opponentCard ) {
            const opponentID = opponentCard.playerID
            const opponentUsername = opponentCard.username
            
            const myConfirmed = collection(db, myConfirmedGamesRef)
            const opponentPending = collection(db, `users/${opponentID}/pendingGames`)
            const opponentConfirmed = collection(db, `users/${opponentID}/confirmedGames`)
           
            const pendingQuerySnapshot = await getDocs(opponentPending);
            const availableGamesQuerySnapshot = await getDocs(gamesCollectionRef)

            console.log(opponentCard, currentUsername, opponentUsername)
        
            const matchingPendingDocs = pendingQuerySnapshot.docs.filter(doc => {
             const data = doc.data();
             return data.dateOfGame === opponentCard.dateOfGame && data.time === opponentCard.time;
            });

            const matchingAvailableGamesDocs = availableGamesQuerySnapshot.docs.filter(doc => {
                const data = doc.data();
                return data.dateOfGame === opponentCard.dateOfGame && data.time === opponentCard.time;
               });
           
            matchingPendingDocs.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            matchingAvailableGamesDocs.forEach(async (doc) => {
                await deleteDoc(doc.ref)
            })

            // Logged in player's opponent should be the opponentID and username and the opponent's opponent should be the current users ID and username
            // My opponent --> opponent ID
            // Their opponent --> my ID
            opponentCard.opponent = opponentUsername
            opponentCard.opponentID = opponentID
            await addDoc(myConfirmed, opponentCard);

            opponentCard.opponent = currentUsername
            opponentCard.opponentID = currentUserID
            await addDoc(opponentConfirmed, opponentCard);
           

            setRefreshToken(refreshToken + 1)
        }

        return (
            <section id="find-game" style={gridStyle}>
                <h1 style={h1Style}>Find a game</h1>
                <div style={horizontalLine}></div>
                <p style={paragraph}></p>
                <div style={{ ...carouselLocation, ...flexboxRow }}>

                    <Carousel>
                    {availableGames.map((index, i) => (
                        <Card key={index} currentCard={availableGames[i]}/>
                    ))}
                    </Carousel>

                </div>
            </section>
        )
    };      
    const History = () => {

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

        {/* <PlayerRating /> */ } 
        <CreateGameButton />
        <Navbar />

        <Welcome />
        <MyGames />
        <FindGames />
        <History />


        <RatingsSection />
    </div>
  );
  
};

export default Homepage;