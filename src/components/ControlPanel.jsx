import React from 'react';

const ControlPanel = ({
  visualizationMode,
  onVisualizationModeChange,
  totalPatients,
  geocodedPatients,
  isLoading,
  progress,
  maxDistance,
  onMaxDistanceChange,
}) => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '20px',
    }}>
      <div style={{ flex: '1', minWidth: '200px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>
          Patient Location Map
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          {isLoading ? (
            `Loading patients... ${Math.round(progress * 100)}%`
          ) : (
            `Showing ${geocodedPatients} of ${totalPatients} patients`
          )}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label style={{ fontSize: '14px', fontWeight: '500' }}>
          Visualization:
        </label>
        <select
          value={visualizationMode}
          onChange={(e) => onVisualizationModeChange(e.target.value)}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <option value="clusters">Clusters</option>
          <option value="markers">Individual Markers</option>
          <option value="heatmap">Heat Map</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label style={{ fontSize: '14px', fontWeight: '500' }}>
          Max Distance:
        </label>
        <select
          value={maxDistance}
          onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <option value={999}>All Distances</option>
          <option value={1}>Within 1 mile</option>
          <option value={2}>Within 2 miles</option>
          <option value={5}>Within 5 miles</option>
          <option value={10}>Within 10 miles</option>
          <option value={20}>Within 20 miles</option>
        </select>
      </div>

      {isLoading && (
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e0e0e0',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '12px',
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#1976d2',
            width: `${progress * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
