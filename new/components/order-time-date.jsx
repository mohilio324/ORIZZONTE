
import L from "leaflet";

// This fix ensures the marker icons are found in the production build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});






import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./OrderTimeDate.css";

// Leaflet Icon Fix
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
};

function LocationMarker({ position, setPosition, setAddress }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        },
    });
    return position ? <Marker position={position} /> : null;
}

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

function OrderTimeDate() {
  const Navigate = useNavigate();

  // Core Data (cap)
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  
  const [isNow, setIsNow] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [h, setH] = useState("19");
  const [m, setM] = useState("03");

  // Popups
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectingType, setSelectingType] = useState(null);

  // Map Helpers
  const [mapCenter, setMapCenter] = useState([28.0339, 1.6596]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isNow) {
      const now = new Date();
      setManualDate(now.toLocaleDateString('en-GB'));
      setH(now.getHours().toString().padStart(2, '0'));
      setM(now.getMinutes().toString().padStart(2, '0'));
    }
  }, [isNow]);

  useEffect(() => {
    if (pickupCoords && deliveryCoords) {
      setDistance(calculateDistance(pickupCoords.lat, pickupCoords.lng, deliveryCoords.lat, deliveryCoords.lng));
    }
  }, [pickupCoords, deliveryCoords]);

  const handleSearch = async () => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&countrycodes=dz`);
    const data = await res.json();
    if (data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      setMapCenter([coords.lat, coords.lng]);
      if (selectingType === "pickup") { setPickup(data[0].display_name); setPickupCoords(coords); }
      else { setDelivery(data[0].display_name); setDeliveryCoords(coords); }
    }
  };

  const adjustTime = (type, delta) => {
    if (type === 'h') {
      let newH = (parseInt(h) || 0) + delta;
      if (newH > 23) newH = 0; else if (newH < 0) newH = 23;
      setH(newH.toString().padStart(2, '0'));
    } else {
      let newM = (parseInt(m) || 0) + delta;
      if (newM > 59) newM = 0; else if (newM < 0) newM = 59;
      setM(newM.toString().padStart(2, '0'));
    }
  };

  const handleNext = () => {
    const cap = { pickup, delivery, distance, isNow, manualDate, manualTime: `${h}:${m}` };
    console.log("Registered Order Data (cap):", cap);
  };

  return (
    <div className="otd-page-container">
      <header className="otd-top-nav">
        <img src="/images/logo.svg" alt="Orizzonte" className="otd-logo" />
        <button className="otd-cancel-link" onClick={() => Navigate("/")}>cancel</button>
      </header>

      <div className="otd-back-wrapper">
        <button className="otd-back-btn" onClick={() => Navigate(-1)}>
          <img src="/images/ARROW.svg" alt="" /> <span>New order</span>
        </button>
      </div>

      <section className="otd-content">
        <div className="otd-heading">
          <img src="/images/solid_route.svg" alt="Route" className="otd-heading-icon" />
          <h2>Route</h2>
        </div>

        {/* Inputs */}
        <div className="otd-input-section">
          <label className="otd-field-label">
            <img src="/images/maplite.svg" alt="Pickup" className="otd-label-icon" />
            Pickup Point
          </label>
          <div className="otd-input-flex">
            <div className="otd-search-box">
              <img src="/images/search.svg" alt="Search" className="otd-search-icon" />
              <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="search for an address" />
            </div>
            <button className="otd-map-action" onClick={() => {setSelectingType("pickup"); setShowMap(true);}}>
              <img src="/images/uiw_map.svg" alt="Map" />
              <span>select on maps</span>
            </button>
          </div>
        </div>

        <div className="otd-input-section">
          <label className="otd-field-label">
            <img src="/images/flag.svg" alt="Delivery" className="otd-label-icon" />
            Delivery Point
          </label>
          <div className="otd-input-flex">
            <div className="otd-search-box">
              <img src="/images/search.svg" alt="Search" className="otd-search-icon" />
              <input value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder="search for an address" />
            </div>
            <button className="otd-map-action" onClick={() => {setSelectingType("delivery"); setShowMap(true);}}>
              <img src="/images/uiw_map.svg" alt="Map" />
              <span>select on maps</span>
            </button>
          </div>
        </div>

        {distance && <div className="otd-distance-badge">Distance: <strong>{distance} km</strong></div>}

        {/* Pickup Details Heading */}
        <div className="otd-heading otd-flex-between">
          <div className="otd-title-group">
            <img src="/images/agenda.svg" alt="Pickup Date and Time" className="otd-heading-icon" />
            <h2>Pickup Date and Time</h2>
          </div>
          <div className="otd-toggle-box">
            <button className={!isNow ? "otd-tgl-btn otd-tgl-orange" : "otd-tgl-btn"} onClick={() => setIsNow(false)}>Later</button>
            <button className={isNow ? "otd-tgl-btn otd-tgl-orange" : "otd-tgl-btn"} onClick={() => setIsNow(true)}>Now</button>
          </div>
        </div>

        {/* Manual Display Boxes */}
        <div className="otd-manual-pickers">
          <div className="otd-custom-select" onClick={() => !isNow && setShowDatePicker(true)}>
            <img src="/images/agenda1.svg" alt="Date icon" className="otd-custom-icon" />
            <span className={!manualDate ? "otd-ph" : "otd-val"}>{manualDate || "Enter the Date"}</span>
          </div>

          <div className="otd-custom-select" onClick={() => !isNow && setShowTimePicker(true)}>
            <img src="/images/clock1.svg" alt="Time icon" className="otd-custom-icon" />
            <span className="otd-val">{h}:{m}</span>
          </div>
        </div>

        {/* MAP MODAL */}
        {showMap && (
          <div className="otd-modal-overlay">
            <div className="otd-map-card">
              <div className="otd-time-nav">
                <span className="otd-dismiss" onClick={() => setShowMap(false)}>Cancel</span>
                <div className="otd-map-search-wrapper">
                    <input placeholder="Search Algeria..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <button onClick={handleSearch}>Find</button>
                </div>
              </div>
              <div className="otd-map-wrapper">
                <MapContainer center={mapCenter} zoom={5} style={{ height: "100%" }}>
                    <ChangeView center={mapCenter} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker 
                        position={selectingType === "pickup" ? pickupCoords : deliveryCoords} 
                        setPosition={selectingType === "pickup" ? setPickupCoords : setDeliveryCoords}
                        setAddress={selectingType === "pickup" ? setPickup : setDelivery}
                    />
                </MapContainer>
              </div>
              <button className="otd-map-done-btn" onClick={() => setShowMap(false)}>Confirm Selection</button>
            </div>
          </div>
        )}

        {/* DATE MODAL */}
        {showDatePicker && (
          <div className="otd-modal-overlay">
            <div className="otd-calendar-card">
              <div className="otd-cal-header"><span>&lt;</span> <strong>April 2026</strong> <span>&gt;</span></div>
              <div className="otd-cal-grid">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="otd-cal-label">{d}</div>)}
                {[...Array(30)].map((_, i) => (
                  <div key={i} className={i + 1 === 17 ? "otd-day active" : "otd-day"} onClick={() => {setManualDate(`${i + 1} April 2026`); setShowDatePicker(false);}}>{i + 1}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TIME MODAL */}
        {showTimePicker && (
          <div className="otd-modal-overlay">
            <div className="otd-time-card">
              <div className="otd-time-nav">
                <span className="otd-dismiss" onClick={() => setShowTimePicker(false)}>Dismiss</span>
                <strong>Set Time</strong>
                <span className="otd-save" onClick={() => setShowTimePicker(false)}>Save</span>
              </div>
              <div className="otd-time-selector-ui">
                <div className="otd-time-column">
                  <button onClick={() => adjustTime('h', 1)}>▲</button>
                  <input value={h} readOnly />
                  <button onClick={() => adjustTime('h', -1)}>▼</button>
                </div>
                <span className="otd-time-sep">:</span>
                <div className="otd-time-column">
                  <button onClick={() => adjustTime('m', 1)}>▲</button>
                  <input value={m} readOnly />
                  <button onClick={() => adjustTime('m', -1)}>▼</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="otd-action">
          <button className="otd-next-btn" onClick={handleNext}>Next</button>
        </div>
      </section>
    </div>
  );
}

export default OrderTimeDate;