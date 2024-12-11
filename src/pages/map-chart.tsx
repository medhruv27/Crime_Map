import { useEffect, useState, useRef } from "react";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Marker, Popup, TileLayer, GeoJSON } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { useCoordinates } from "./coordinates-context";

const mapboxToken = "pk.eyJ1IjoidmluZWV0aC1hYnJpZ2h0bGFiIiwiYSI6ImNtMzlud3RiMDBrangyaXNham05eWZhM3kifQ.Dj1xFtR7eFdEUJ3TlhHO1Q";
// Changed to monochrome style for better color visibility
const mapboxStyle = "mapbox/light-v10";

const MapChart = () => {
  const [policeAreas, setPoliceAreas] = useState(null);
  const [crimeRates, setCrimeRates] = useState(null);
  const { coordinates } = useCoordinates();
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    Promise.all([
      fetch("/police_areas.geojson").then(response => response.json()),
      fetch("/crime_rate.json").then(response => response.json())
    ])
      .then(([geoData, crimeData]) => {
        setPoliceAreas(geoData);
        setCrimeRates(crimeData);
      })
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(coordinates, 13);
    }
  }, [coordinates]);

  // Updated color scheme using more pleasing colors
  const getColor = (crimeRate: number) => {
    // Softer, more professional color palette
    if (crimeRate >= 150) return "#ef4444";      // Soft red
    if (crimeRate >= 100) return "#f87171";      // Lighter red
    if (crimeRate >= 75) return "#fcd34d";       // Warm yellow
    if (crimeRate >= 50) return "#86efac";       // Light green
    return "#4ade80";                            // Medium green
  };

  const geoJsonStyle = (feature) => {
    if (!crimeRates || !feature.properties.PFA20NM) return {
      color: "#e5e7eb",          // Light gray border
      weight: 1,                 // Thinner border
      fillOpacity: 0.2
    };

    const areaKey = feature.properties.PFA20NM.toLowerCase().replace(/\s+/g, '-') + '-street';
    const crimeRate = crimeRates[areaKey];

    return {
      color: "#d1d5db",          // Subtle gray border
      weight: 1,                 // Thinner border
      fillColor: getColor(crimeRate),
      fillOpacity: 0.7           // Slightly more opaque
    };
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.PFA20NM) {
      const areaKey = feature.properties.PFA20NM.toLowerCase().replace(/\s+/g, '-') + '-street';
      const crimeRate = crimeRates ? crimeRates[areaKey] : 'N/A';
      
      layer.bindPopup(`
        <div style="font-family: system-ui, sans-serif;">
          <strong style="font-size: 14px;">${feature.properties.PFA20NM}</strong><br/>
          <span style="color: #666;">Crime Rate: ${crimeRate}</span>
        </div>
      `);
    }

    layer.on({
      mouseover: (e) => {
        layer.setStyle({
          weight: 2,
          color: "#9ca3af",      // Darker gray on hover
          fillOpacity: 0.8       // More opaque on hover
        });
      },
      mouseout: (e) => {
        layer.setStyle(geoJsonStyle(feature));
      }
    });
  };

  return (
    <MapContainer
      className="w-full h-screen"
      center={coordinates}
      zoom={8}
      scrollWheelZoom={false}
      markerZoomAnimation={true}
      ref={mapRef}
      // Added map style options for better visuals
      style={{ background: "#f8fafc" }}
    >
      <TileLayer
        attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://labs.mapbox.com/contribute/" target="_blank">Improve this map</a></strong>'
        url={`https://api.mapbox.com/styles/v1/${mapboxStyle}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`}
      />
      {policeAreas && crimeRates && (
        <GeoJSON 
          data={policeAreas} 
          style={geoJsonStyle} 
          onEachFeature={onEachFeature} 
        />
      )}
      <Marker position={coordinates}>
        <Popup>
          <div style="font-family: system-ui, sans-serif;">
            Selected Location
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapChart;