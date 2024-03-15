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
import {createCaptainJsonFromArray, createScoreJsonFromArray, createTeamJsonFromArray} from '../../utils/toJSON'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';


import '../../assets/styling/ScoreInput.css'

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
    <Box sx={{ display: 'flex', justifyContent: 'center'}} >
      <Button variant="plain" color="neutral" onClick={toggleDrawer(true)}>
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
            const teammateIdArray = Object.values(currentCard.teammates)
            const profiles = await axios.get(`https://hoop-easy-production.up.railway.app/api/getProfiles?arrayOfID=${teammateIdArray}`)
            setProfiles(profiles.data)
        }

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
            <ListItem key={uuidv4()}>
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
        return <div>Please complete step 1 and step 2 first</div>
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

        const captainJSON = createCaptainJsonFromArray([teamOneCaptain.userID, teamTwoCaptain.userID])
        const scoreJSON = createScoreJsonFromArray([scoreData.teamOneScore.toString(), scoreData.teamTwoScore.toString()])
        const teamOneArray = team1.map((obj) => obj.id)
        const teamTwoArray = team2.map((obj) => obj.id)
        const teamOne = createTeamJsonFromArray(teamOneArray)
        const teamTwo = createTeamJsonFromArray(teamTwoArray)

        await axios.put('https://hoop-easy-production.up.railway.app/api/handleGameSubmission', {
            params: {
              status: 'verification',
              teamOne: teamOne,  
              teamTwo: teamTwo,
              captainJSON: captainJSON,
              scoreJSON: scoreJSON,
              gameID: currentCard.gameID
            }
        })
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
            <Button 
                onClick={() => handleScoreSubmission(currentCard, scoreData)} 
                color="primary"
                size="medium"
                variant="filled"
            >
                Submit Scores
            </Button>
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




