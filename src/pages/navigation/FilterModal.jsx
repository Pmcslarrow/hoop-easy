import {useState} from 'react';
import { Transition } from 'react-transition-group';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Box from '@mui/joy/Box';
import Slider, { sliderClasses } from '@mui/joy/Slider';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { Chip } from '@mui/joy';


export default function FadeModalDialog() {
    const [open, setOpen] = useState(false);
    const [playerOverallValue, setPlayerOverallValue] = useState([60, 99]);
    const [gameDistanceValue, setGameDistanceValue] = useState([0, 100]);

    function handleSubmit(e) {
        const selectedGameTypes = document.getElementsByClassName('selected-values')
        const gameTypes = []
        for(let i = 0; i < selectedGameTypes.length; i++) {
            gameTypes.push(selectedGameTypes[i].innerText[0])
        }

        console.log('Selected game types: ', gameTypes)
        console.log('Player Overall Value:', playerOverallValue);
        console.log('Game Distance Value:', gameDistanceValue);
    }

    return (
    <>
      <Button id='filter-button' onClick={() => setOpen(true)}>
        Filter
      </Button>
      <Transition in={open} timeout={400}>
        {(state) => (
          <Modal
            keepMounted
            open={!['exited', 'exiting'].includes(state)}
            onClose={() => setOpen(false)}
            slotProps={{
              backdrop: {
                sx: {
                  opacity: 0,
                  backdropFilter: 'none',
                  transition: `opacity 500ms, backdrop-filter 500ms`,
                  ...{
                    entering: { opacity: 1, backdropFilter: 'blur(8px)' },
                    entered: { opacity: 1, backdropFilter: 'blur(8px)' },
                  }[state],
                },
              },
            }}
            sx={{
              visibility: state === 'exited' ? 'hidden' : 'visible',
            }}
          >
            <ModalDialog
              sx={{
                opacity: 0,
                transition: `opacity 500ms`,
                ...{
                  entering: { opacity: 1 },
                  entered: { opacity: 1 },
                }[state],
              }}
              id='modal'
            >
              <DialogTitle>Filter Games</DialogTitle>
              <DialogContent>
                <div>
                    <SelectMultipleAppearance />
                </div>
                <hr />
                <div>
                    Player Overall
                    <RangeSlider
                        value={playerOverallValue}
                        setValue={setPlayerOverallValue}
                        minimum={60}
                        maximum={99}
                    />                
                </div>
                <hr />
                <div>
                    Game Distance
                    <RangeSlider
                        value={gameDistanceValue}
                        setValue={setGameDistanceValue}
                        minimum={0}
                        maximum={100}
                    />                
                </div>
                <button onClick={handleSubmit}>Submit</button>
              </DialogContent>
            </ModalDialog>
          </Modal>
        )}
      </Transition>
    </>
  );
}


function valueText(value) {
    return `${value} Miles`;
}

function RangeSlider({ value, setValue, minimum, maximum }) {
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box className="slider-outer" sx={{ width: '80%', margin: "auto", padding: '25px' }}>
            <Slider
                getAriaLabel={() => 'Temperature range'}
                value={value}
                onChange={handleChange}
                valueLabelDisplay="on"
                getAriaValueText={valueText}
                color="neutral"
                min={minimum}
                max={maximum}
            />
        </Box>
    );
}

function SelectMultipleAppearance() {
    return (
      <Select
        id = 'select-multiple'
        multiple
        defaultValue={['1', '2', '3', '4', '5']}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', gap: '0.25rem' }}>
            {selected.map((selectedOption) => (
              <Chip variant="soft" color="primary" className='selected-values'>
                {selectedOption.label}
              </Chip>
            ))}
          </Box>
        )}
        sx={{
          minWidth: '15rem',
        }}
        slotProps={{
          listbox: {
            sx: {
              width: '100%',
            },
          },
        }}
      >
        <Option value="1">1v1</Option>
        <Option value="2">2v2</Option>
        <Option value="3">3v3</Option>
        <Option value="4">4v4</Option>
        <Option value="5">5v5</Option>
      </Select>
    );
  }