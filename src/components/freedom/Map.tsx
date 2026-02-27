import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "70vh",
  borderRadius: "12px",
};

const center = {
  lat: -42.5,
  lng: 172.5,
};

const locations = [
  { name: "Greymouth", lat: -42.45, lng: 171.21 },
  { name: "Hokitika", lat: -42.72, lng: 170.96 },
  { name: "Hanmer Springs", lat: -42.52, lng: 172.83 },
  { name: "Kaikōura", lat: -42.40, lng: 173.68 },
];

const mapOptions: google.maps.MapOptions = {
  mapTypeId: "terrain",
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
};

const Map: React.FC = () => {
  return (
      <LoadScript
         googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={7}
        options={mapOptions}
      >
        {locations.map((location) => (
          <Marker
            key={location.name}
            position={{ lat: location.lat, lng: location.lng }}
            title={location.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
