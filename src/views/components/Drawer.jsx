import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Teammates from './Teammates';
import { FirebaseQuery } from '../functions/FirebaseQuery'
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore'
import {db} from '../../config/firebase'
import '../styling/ScoreInput.css'

export default function ScoreDrawer({props}) {
    const {currentCard, currentUser, refreshToken, setRefreshToken} = props
    const [open, setOpen] = useState(false);

    const toggleDrawer = (inOpen) => (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'LABEL') {
        return;
        }
    
        if (
        event.type === 'keydown' &&
        (event.key === 'Tab' || event.key === 'Shift')
        ) {
        return;
        }
    
        setOpen(inOpen);
    };
  

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }} >
      <Button variant="outlined" color="neutral" onClick={toggleDrawer(true)} id='submitScoreButton'>
        Submit Score
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)} anchor="bottom" size="lg">
        <Box
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
            <ScoreInput props={{
                currentCard,
                currentUser,
                refreshToken,
                setRefreshToken
                }}
            />
        </Box>
      </Drawer>
    </Box>
  );
}


function ScoreInput({props}) {
    const {currentCard, currentUser, refreshToken, setRefreshToken} = props
    const query = new FirebaseQuery(currentCard, currentUser);
    const [profiles, setProfiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(0); 
    const [selectedObjects, setSelectedObjects] = useState([]);
    const [teamOneCaptain, setTeamOneCaptain] = useState({
        username: '',
        userID: ''
    });     
    const [teamTwoCaptain, setTeamTwoCaptain] = useState({
        username: '',
        userID: ''
      });      
    const [scoreData, setScoreData] = useState({
        teamOneScore: '',
        teamTwoScore: ''
    });

  useEffect(() => {
    const fetchTeammates = async () => {
      const profiles = await query.getTeammateProfiles(currentCard.teammates);
      setProfiles(profiles);
    };

    fetchTeammates();
  }, []);


  const handlePageChange = (event, newValue) => {
    setCurrentPage(newValue);
  };

  const handleTabClick = (event) => {
    event.stopPropagation();
  };

  const handleCheckboxChange = (selectedObj) => {
    if (selectedObjects.some(obj => obj.username === selectedObj.username)) {
      setSelectedObjects(prevObjects => prevObjects.filter(obj => obj.username !== selectedObj.username));
    } else {
      setSelectedObjects(prevObjects => [...prevObjects, selectedObj]);
    }
  };


    const handleTeamOneScoreChange = useCallback((event) => {
        let { value } = event.target;
        value = parseInt(value, 10);
        value = Math.min(Math.max(value, 0), 99);
        setScoreData((prevData) => ({ ...prevData, teamOneScore: value }));
    }, []);

    const handleTeamTwoScoreChange = useCallback((event) => {
        let { value } = event.target;
        value = parseInt(value, 10);
        value = Math.min(Math.max(value, 0), 99);
        setScoreData((prevData) => ({ ...prevData, teamTwoScore: value }));
    }, []);
  
    const renderProfilesForCurrentPage = ( callback ) => {
        return profiles.map((obj) => (
            <ListItem key={obj.userID}>
                <Checkbox
                    disabled={false}
                    label={obj.username}
                    size="md"
                    variant="outlined"
                    checked={selectedObjects.some(o => o.username === obj.username)}
                    onChange={() => callback(obj)}
                />
            </ListItem>
        ));
    };

    function selectCaptainFromTeamOne( teamOne ) {
        const handleChange = (event, newValue) => {
            const selectedUser = teamOne.find((user) => user.username === newValue);
          
            if (selectedUser) {
              setTeamOneCaptain({
                username: selectedUser.username,
                userID: selectedUser.id
              });
            }
        };

        const handleClick = (event) => {
            event.stopPropagation()
        }
      
        const options = teamOne.map((obj) => (
          <Option value={obj.username} onChange={handleChange} onClick={handleClick}>
            {obj.username}
          </Option>
        ));
      
        return (
          <Select defaultValue={teamOneCaptain} onChange={handleChange} onClick={handleClick}>
            {options}
          </Select>
        );
    }

    function selectCaptainFromTeamTwo( teamTwo ) {
        const handleChange = (event, newValue) => {
            const selectedUser = teamTwo.find((user) => user.username === newValue);
          
            if (selectedUser) {
              setTeamTwoCaptain({
                username: selectedUser.username,
                userID: selectedUser.id
              });
            }
        };

        const handleClick = (event) => {
            event.stopPropagation()
        }
        
          const options = teamTwo.map((obj) => (
            <Option value={obj.username} onChange={handleChange} onClick={handleClick}>
              {obj.username}
            </Option>
          ));
        
          return (
            <Select defaultValue={teamTwoCaptain} onChange={handleChange} onClick={handleClick}>
              {options}
            </Select>
          );
    }
      
  const teamSelectionTab = () => {
    return (
        <>
            <h2>Select the players who played on team 1</h2>
            <br />
            <List>
                {renderProfilesForCurrentPage(handleCheckboxChange)}
            </List>
        </>
    )
  }

  const captainSelectionTab = () => {
    const team1 = selectedObjects
    const team2 = profiles.filter((profile) => {
        return !selectedObjects.some(obj => obj.username === profile.username);
    });

    if ( team1.length !== team2.length ) {
        return <div>Please make sure that the teams have equal number of players</div>
    }

    return (
      <>
        <h2>Select Team 1 Captain</h2>
        {selectCaptainFromTeamOne(team1)}
  
        <br />
        <h2>Select Team 2 Captain</h2>
        {selectCaptainFromTeamTwo(team2)}
      </>
    );
  }

  const scoreSubmissionTab = () => {
    const team1 = selectedObjects
    const team2 = profiles.filter((profile) => {
        return !selectedObjects.some(obj => obj.username === profile.username);
    });
    
    if ( team1.length !== team2.length || teamOneCaptain.username === '' || teamTwoCaptain.username === '' ) {
        return <div>Please make sure you complete step 1 and step 2</div>
    }

    const renderTeamOne = team1.map((player) => {
        return <div>{player.username}</div>
    })

    const renderTeamTwo = team2.map((player) => {
        return <div>{player.username}</div>
    })

    const handleScoreSubmission = async ( currentCard, scoreData ) => {
        const { teamOneScore, teamTwoScore } = scoreData
        if ( !teamOneScore || !teamTwoScore ) {
            console.log("Please fill out the game info.")
            return
        }

        const teamOneObject = {
            captain: teamOneCaptain.userID,
            team: team1,
            thisTeamScore: teamOneScore,
            opponentTeamScore: teamTwoScore
        }

        const teamTwoObject = {
            captain: teamTwoCaptain.userID,
            team: team2,
            thisTeamScore: teamTwoScore,
            opponentTeamScore: teamOneScore
        }

        console.log(teamOneObject)
        console.log(teamTwoObject)
        setRefreshToken(refreshToken + 1)

        return

        /**
         * Need to rename the variables and think about it for n number of players on two teams instead of 1v1. 
         * dataForCurrentPlayerCollection should become dataForTeamOnePlayers
         * dataForOpponentCollection should become dataForTeamTwoPlayers
         */
        const dataForCurrentPlayerCollection = {
            ...currentCard,
            playerID: currentUser.id,
            score: {
                playerScore: teamOneScore,
                teamTwoScore: teamTwoScore
            },
            gameApprovalStatus: true,
        };
        const dataForOpponentCollection = {
            ...currentUser,
            opponentID: currentUser.id,
            opponent: currentUser.username,
            email: currentUser.email,
            firstName: currentUser.firstName,
            heightFt: currentUser.heightFt,
            heightInches: currentUser.heightInches,
            playerID: currentCard.playerID,
            lastName: currentUser.lastName,
            score: {
                playerScore: teamTwoScore,
                teamTwoScore: teamOneScore
            },
            gameApprovalStatus: false
        };

        const playerDocID = currentCard.id;
        const playerDocRef = doc(db, `users/${currentUser.id}/confirmedGames`, playerDocID);
        const opponentConfirmed = collection(db, `users/${currentCard.opponentID}/confirmedGames`); // This is looking at a single opponentID which doesnt exit. Iterate through teammates
        const opponentConfirmedSnapshot = await getDocs(opponentConfirmed);

        console.log(currentCard)
        console.log(`users/${currentCard.opponentID}/confirmedGames`)

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
    };


    return (
        <div>
            <div className='teams'>
                Team 1
                <List component="ol">
                    {renderTeamOne}
                </List>
                <input
                    id='teamOneScore'
                    type='number'
                    placeholder='Team 1 Score'
                    onChange={handleTeamOneScoreChange}
                    value={scoreData.teamOneScore}
                    min='0'
                    max='99'
                    className='placeholderStyle'
                />
            </div>
            <br/>
            <div className='teams'>
                Team 2
                <List component="ol">
                    {renderTeamTwo}
                </List>
                <input
                    id='teamTwoScore'
                    type='number'
                    placeholder='Team 2 Score'
                    onChange={handleTeamTwoScoreChange}
                    value={scoreData.teamTwoScore}
                    min='0'
                    max='99'
                    className='placeholderStyle'
                />

            </div>
            <br />
            <button onClick={() => handleScoreSubmission(currentCard, scoreData)} >Submit Scores</button>
        </div>
    )
  }

  return (
    <div id="scoreSubmissionForm">
      <Tabs
        value={currentPage}
        onChange={handlePageChange}
        indicatorColor="primary"
        textColor="primary"
        onClick={handleTabClick}
        centered
      >
        <Tab label="Step 1" />
        <Tab label="Step 2" />
        <Tab label="Step 3" />
      </Tabs>
      {currentPage === 0 ? teamSelectionTab() : ''}
      {currentPage === 1 ? captainSelectionTab() : ''}
      {currentPage === 2 ? scoreSubmissionTab() : ''}
    </div>
  );
}




