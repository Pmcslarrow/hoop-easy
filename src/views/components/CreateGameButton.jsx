// CreateGameButton.js

import React from 'react';
import addButton from '../../images/add.png';

const CreateGameButton = ( { setCreateGameActive, isCreateGameActive } ) => {

    function toggleCreateGame() {
        setCreateGameActive(!isCreateGameActive)
    }

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
        <div id='new-game' style={{ ...flexCol, ...card }} onClick={toggleCreateGame}>
            <img src={addButton} alt='Add button' style={{ width: '50px' }} />
            <div>NEW GAME</div>
        </div>
    );
};

export { CreateGameButton };