import {useState, useEffect} from 'react';
import { Transition } from 'react-transition-group';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Box from '@mui/joy/Box';
import Slider from '@mui/joy/Slider';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { Chip } from '@mui/joy';

export default function FadeModalDialog({ playerOverallValue, setPlayerOverallValue, gameDistanceValue, setGameDistanceValue, gameTypes, handleSubmit }) {
    const [open, setOpen] = useState(false);

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
                    <SelectMultipleAppearance gameTypes={gameTypes}/>
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
                    Game Distance (Miles)
                    <RangeSlider
                        value={gameDistanceValue}
                        setValue={setGameDistanceValue}
                        minimum={0}
                        maximum={200}
                    />                
                </div>
                <button onClick={handleSubmit} id='filter-button'>Submit</button>
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

function SelectMultipleAppearance({gameTypes}) {
    return (
      <Select
        id = 'select-multiple'
        multiple
        defaultValue={gameTypes}
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