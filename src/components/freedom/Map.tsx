import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface MapLocation {
  name: string;
  lat: number;
  lng: number;
}

interface MapProps {
  locations?: MapLocation[];
  center?: { lat: number; lng: number };
  height?: string;
}

const defaultCenter = {
  lat: -42.5,
  lng: 172.5,
};

const defaultLocations: MapLocation[] = [
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

const Map: React.FC<MapProps> = ({ locations = defaultLocations, center = defaultCenter, height = "70vh" }) => {
  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: height,
    borderRadius: "12px",
  };

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
        {locations.map((location, index) => (
          <Marker
            key={`${location.name}-${index}`}
            position={{ lat: location.lat, lng: location.lng }}
            title={location.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
