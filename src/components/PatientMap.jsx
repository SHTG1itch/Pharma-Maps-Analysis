import React, { useState, useCallback, useMemo } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  MarkerClusterer,
  Marker,
  InfoWindow,
  HeatmapLayer
} from '@react-google-maps/api';

const libraries = ['visualization', 'places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Default center (Mercer Island, WA - where the pharmacy is)
const defaultCenter = {
  lat: 47.5707,
  lng: -122.2221
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
};

const clusterStyles = [
  {
    textColor: 'white',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
        <circle cx="25" cy="25" r="24" fill="#1976d2" opacity="0.8"/>
      </svg>
    `),
    height: 50,
    width: 50,
  },
  {
    textColor: 'white',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
        <circle cx="30" cy="30" r="29" fill="#1565c0" opacity="0.8"/>
      </svg>
    `),
    height: 60,
    width: 60,
  },
  {
    textColor: 'white',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70">
        <circle cx="35" cy="35" r="34" fill="#0d47a1" opacity="0.8"/>
      </svg>
    `),
    height: 70,
    width: 70,
  },
];

const PatientMap = ({ patients, apiKey, visualizationMode = 'clusters' }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Filter patients with valid coordinates
  const validPatients = useMemo(() => {
    return patients.filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng);
  }, [patients]);

  // Prepare markers data
  const markers = useMemo(() => {
    return validPatients.map((patient, index) => ({
      id: index,
      position: {
        lat: patient.coordinates.lat,
        lng: patient.coordinates.lng,
      },
      patient: patient,
    }));
  }, [validPatients]);

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    if (!isLoaded || visualizationMode !== 'heatmap') return [];
    
    return validPatients.map(patient => ({
      location: new window.google.maps.LatLng(
        patient.coordinates.lat,
        patient.coordinates.lng
      ),
      weight: 1,
    }));
  }, [validPatients, isLoaded, visualizationMode]);

  const onLoad = useCallback((map) => {
    setMap(map);
    
    // Fit bounds to show all markers
    if (validPatients.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      validPatients.forEach(patient => {
        bounds.extend({
          lat: patient.coordinates.lat,
          lng: patient.coordinates.lng,
        });
      });
      map.fitBounds(bounds);
    }
  }, [validPatients]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = useCallback((marker) => {
    setSelectedPatient(marker);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPatient(null);
  }, []);

  if (loadError) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error loading Google Maps: {loadError.message}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ padding: '20px' }}>
        Loading Google Maps...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {visualizationMode === 'clusters' && markers.length > 0 && (
        <MarkerClusterer
          options={{
            styles: clusterStyles,
            gridSize: 60,
            maxZoom: 15,
          }}
        >
          {(clusterer) =>
            markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                clusterer={clusterer}
                onClick={() => handleMarkerClick(marker)}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: '#1976d2',
                  fillOpacity: 0.8,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
              />
            ))
          }
        </MarkerClusterer>
      )}

      {visualizationMode === 'markers' && markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          onClick={() => handleMarkerClick(marker)}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#1976d2',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
        />
      ))}

      {visualizationMode === 'heatmap' && heatmapData.length > 0 && (
        <HeatmapLayer
          data={heatmapData}
          options={{
            radius: 20,
            opacity: 0.6,
            gradient: [
              'rgba(0, 255, 255, 0)',
              'rgba(0, 255, 255, 1)',
              'rgba(0, 191, 255, 1)',
              'rgba(0, 127, 255, 1)',
              'rgba(0, 63, 255, 1)',
              'rgba(0, 0, 255, 1)',
              'rgba(0, 0, 223, 1)',
              'rgba(0, 0, 191, 1)',
              'rgba(0, 0, 159, 1)',
              'rgba(0, 0, 127, 1)',
              'rgba(63, 0, 91, 1)',
              'rgba(127, 0, 63, 1)',
              'rgba(191, 0, 31, 1)',
              'rgba(255, 0, 0, 1)'
            ],
          }}
        />
      )}

      {selectedPatient && (
        <InfoWindow
          position={selectedPatient.position}
          onCloseClick={handleInfoWindowClose}
        >
          <div style={{ maxWidth: '250px', padding: '8px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
              Patient Information
            </h3>
            <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ margin: '4px 0' }}>
                <strong>System ID:</strong> {selectedPatient.patient.systemId}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>City:</strong> {selectedPatient.patient.city}, {selectedPatient.patient.state}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Distance:</strong> {selectedPatient.patient.distance.toFixed(2)} miles
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Prescriptions:</strong> {selectedPatient.patient.rxCount}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Revenue:</strong> {selectedPatient.patient.revenue}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Profit:</strong> {selectedPatient.patient.profit}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Maintenance Drug:</strong> {selectedPatient.patient.maintenanceDrug}
              </p>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default PatientMap;
