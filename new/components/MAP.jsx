import React, { useState, useEffect } from 'react'; // 1. Added useEffect
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MAP.css';


import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// used to show icon when clickgin
function ClickManager({ onClick }) {
    const map = useMap();
    useEffect(() => {
        const handleClick = (e) => {
            onClick([e.latlng.lat, e.latlng.lng]);
        };
        map.on('click', handleClick);
        return () => map.off('click', handleClick);
    }, [map, onClick]);
    return null;
}

// moves marker to the currient position like tizi
function RecenterAutomatically({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 13); // location
        }
    }, [position, map]);
    return null;
}

const Map = () => {
    
    const [position, setPosition] = useState([51.505, -0.09]);

    // 2. Locate the user on mount
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                    console.log("Location found:", latitude, longitude);
                },
                (err) => {
                    console.error("User denied location access or error occurred:", err);
                }
            );
        }
    }, []);

    return (
        <div className="map-wrapper">
            <MapContainer 
                center={position} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <ClickManager onClick={(coords) => setPosition(coords)} />
                
                {/* 3. This moves the map view once the state updates with your GPS */}
                <RecenterAutomatically position={position} />

                <Marker position={position} />
            </MapContainer>
        </div>
    );
};

export default Map;