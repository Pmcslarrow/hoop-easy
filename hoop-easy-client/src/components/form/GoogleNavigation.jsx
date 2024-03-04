import React, { useRef } from "react";
import { StandaloneSearchBox, LoadScript } from "@react-google-maps/api";

const libraries = ["places"];
const { REACT_APP_GOOGLE_API } = process.env

export default function GoogleNavigation({ setGameLocation, setCoordinates }) {
    const inputRef = useRef();

    const handlePlaceChanged = () => {
        const [place] = inputRef.current.getPlaces();
        if (place) {
            setGameLocation(place.formatted_address);
            setCoordinates({
                longitude: place.geometry.location.lng(),
                latitude: place.geometry.location.lat()
            });
        }
    };

    return (
        <LoadScript
            googleMapsApiKey={REACT_APP_GOOGLE_API}
            libraries={libraries} 
        >
            <StandaloneSearchBox
                onLoad={ref => {
                    inputRef.current = ref;
                }}
                onPlacesChanged={handlePlaceChanged}
            >
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Game Location"
                    style={{ width: "95%", padding: "10px" }}
                />
            </StandaloneSearchBox>
        </LoadScript>
    );
}
