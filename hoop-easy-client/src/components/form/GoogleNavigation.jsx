import React, { useRef, useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
const { REACT_APP_GOOGLE_API } = process.env

export default function GoogleNavigation ({handlePlaceSelection}) {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address']
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
        handlePlaceSelection(placeAutocomplete.getPlace())
    });
  }, [handlePlaceSelection, placeAutocomplete]);

  return (
    <div className="autocomplete-container" >
      <input ref={inputRef} style={{ width: "95%", padding: "10px" }}/>
    </div>
  );
};

