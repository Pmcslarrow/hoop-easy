import React from 'react';
import { Map, StandaloneSearchBox } from '@vis.gl/react-google-maps';
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";


const MapContainer = ({ longitude, latitude }) => {
  return (
    <Map 
        zoom={10} 
        center={{lat: parseFloat(latitude), lng: parseFloat(longitude)}}  
        disableDefaultUI={true}  
    />
  );
};

export default MapContainer;


