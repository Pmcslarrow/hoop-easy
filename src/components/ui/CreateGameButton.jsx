// CreateGameButton.js

import React from 'react';
import addButton from '../../assets/images/add.png';
import exitButton from '../../assets/images/remove.png';

const CreateGameButton = ({ setCreateGameActive, isCreateGameActive }) => {

  function toggleCreateGame() {
    setCreateGameActive(!isCreateGameActive);
  }

  const card = {
    position: 'fixed',
    width: '60px',
    height: '60px',
    bottom: '0',
    right: '0',
    marginRight: '25px',
    marginBottom: '25px',
};

  const Button = () => {
    if (isCreateGameActive) {
      return (
        <>
          <img src={exitButton} alt='Add button' className='fade-in rotateIn' style={{ width: '50px', ...card }} onClick={toggleCreateGame}/>
        </>
      );
    } else {
      return (
        <>
          <img src={addButton} alt='Add button' className='fade-in rotateIn' style={{ width: '50px', ...card }} onClick={toggleCreateGame}/>
        </>
      );
    }
  };

  return (
      <Button />
  );
};

export { CreateGameButton };
