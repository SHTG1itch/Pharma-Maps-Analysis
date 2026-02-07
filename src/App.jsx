import React, { useState, useEffect } from 'react';
import PatientMap from './components/PatientMap';
import ControlPanel from './components/ControlPanel';
import { parsePatientCSV, anonymizePatient } from './utils/csvParser';
import GeocodingService from './services/geocodingService';
import './App.css';

function App() {
  const [patients, setPatients] = useState([]);
  const [geocodedPatients, setGeocodedPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [visualizationMode, setVisualizationMode] = useState('clusters');
  const [maxDistance, setMaxDistance] = useState(999);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    loadAndGeocodePatients();
  }, []);

  const loadAndGeocodePatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress(0);

      // Check for API key
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        setError('Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
        setIsLoading(false);
        return;
      }

      // Parse CSV
      const rawPatients = await parsePatientCSV('/patients by distance to store.csv');
      console.log(`Loaded ${rawPatients.length} patients from CSV`);

      // Anonymize patient data
      const anonymizedPatients = rawPatients.map(anonymizePatient);
      setPatients(anonymizedPatients);

      // Geocode addresses
      const geocodingService = new GeocodingService(apiKey);
      const addresses = anonymizedPatients.map(p => p.address);
      
      const coordinatesMap = await geocodingService.batchGeocode(
        addresses,
        (prog, count) => {
          setProgress(prog);
          console.log(`Geocoding progress: ${Math.round(prog * 100)}% (${count} addresses)`);
        }
      );

      // Attach coordinates to patients
      const patientsWithCoords = anonymizedPatients.map(patient => ({
        ...patient,
        coordinates: coordinatesMap.get(patient.address) || null,
      }));

      setGeocodedPatients(patientsWithCoords);
      
      const successCount = patientsWithCoords.filter(p => p.coordinates).length;
      console.log(`Successfully geocoded ${successCount} of ${patientsWithCoords.length} patients`);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const filteredPatients = geocodedPatients.filter(
    patient => patient.distance <= maxDistance
  );

  const validPatientCount = filteredPatients.filter(p => p.coordinates).length;

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <div className="error-instructions">
          <h3>Setup Instructions:</h3>
          <ol>
            <li>Get a Google Maps API key from <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
            <li>Enable the following APIs:
              <ul>
                <li>Maps JavaScript API</li>
                <li>Geocoding API</li>
              </ul>
            </li>
            <li>Copy <code>.env.example</code> to <code>.env</code></li>
            <li>Add your API key to <code>.env</code></li>
            <li>Restart the development server</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <ControlPanel
        visualizationMode={visualizationMode}
        onVisualizationModeChange={setVisualizationMode}
        totalPatients={patients.length}
        geocodedPatients={validPatientCount}
        isLoading={isLoading}
        progress={progress}
        maxDistance={maxDistance}
        onMaxDistanceChange={setMaxDistance}
      />
      <div className="map-container">
        {!isLoading && validPatientCount > 0 ? (
          <PatientMap
            patients={filteredPatients}
            apiKey={apiKey}
            visualizationMode={visualizationMode}
          />
        ) : (
          <div className="loading-container">
            <h3>
              {isLoading ? 'Loading patient data...' : 'No patients to display'}
            </h3>
            {isLoading && (
              <p>Geocoding {patients.length} addresses... {Math.round(progress * 100)}%</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
