# Technical Documentation

This document provides technical details about the Patient Location Map implementation.

## Architecture Overview

The application follows a modern React architecture with separation of concerns:

```
┌─────────────────────────────────────────┐
│          Browser (React App)            │
├─────────────────────────────────────────┤
│  Components Layer                       │
│  - App.jsx (main orchestrator)          │
│  - PatientMap (map rendering)           │
│  - ControlPanel (UI controls)           │
├─────────────────────────────────────────┤
│  Services Layer                         │
│  - GeocodingService (API integration)   │
├─────────────────────────────────────────┤
│  Utilities Layer                        │
│  - csvParser (data processing)          │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐
│  Google Maps    │  │  CSV File        │
│  JavaScript API │  │  (public/)       │
│  Geocoding API  │  │                  │
└─────────────────┘  └──────────────────┘
```

## Component Details

### App.jsx (Main Application)

**Responsibilities:**
- Application state management
- Data loading and processing orchestration
- Error handling
- Progress tracking

**State Variables:**
- `patients`: Raw patient data (anonymized)
- `geocodedPatients`: Patients with coordinates
- `isLoading`: Loading state
- `progress`: Geocoding progress (0-1)
- `error`: Error message if any
- `visualizationMode`: Current visualization mode
- `maxDistance`: Distance filter value

**Lifecycle:**
1. Loads CSV file from public directory
2. Parses and anonymizes patient data
3. Batches addresses for geocoding
4. Updates progress during geocoding
5. Renders map when complete

### PatientMap.jsx (Map Component)

**Responsibilities:**
- Google Maps initialization
- Marker rendering
- Clustering logic
- Heatmap rendering
- Info window management

**Key Features:**
- Uses `@react-google-maps/api` for React integration
- Lazy loads Google Maps libraries
- Automatically fits bounds to show all markers
- Handles three visualization modes

**Props:**
- `patients`: Array of patient objects with coordinates
- `apiKey`: Google Maps API key
- `visualizationMode`: 'clusters' | 'markers' | 'heatmap'

### ControlPanel.jsx (UI Controls)

**Responsibilities:**
- Display patient statistics
- Provide visualization mode selector
- Offer distance filtering
- Show loading progress

**Props:**
- `visualizationMode`: Current mode
- `onVisualizationModeChange`: Mode change handler
- `totalPatients`: Total patient count
- `geocodedPatients`: Successfully geocoded count
- `isLoading`: Loading state
- `progress`: Geocoding progress
- `maxDistance`: Current distance filter
- `onMaxDistanceChange`: Distance filter handler

## Service Layer

### GeocodingService.js

**Purpose:** Manage geocoding API calls with caching and rate limiting

**Key Methods:**

#### `geocodeAddress(address)`
- Converts single address to lat/lng
- Checks cache first
- Deduplicates concurrent requests for same address
- Returns `{lat, lng, formatted}` or `null`

#### `batchGeocode(addresses, progressCallback)`
- Processes multiple addresses efficiently
- Batches 10 addresses at a time
- 100ms delay between batches
- Calls progress callback with updates
- Returns Map of address to coordinates

**Caching Strategy:**
- In-memory cache (Map object)
- Key: full address string
- Value: coordinate object
- Persists for session duration
- Prevents duplicate API calls

**Rate Limiting:**
- 10 addresses per batch
- 100ms delay between batches
- Approximately 100 addresses per second
- Prevents Google API rate limit errors

## Utility Layer

### csvParser.js

**Purpose:** Parse CSV and anonymize patient data

#### `parsePatientCSV(filePath)`
- Fetches CSV from public directory
- Uses PapaParse for parsing
- Skips first 2 rows (metadata)
- Filters out invalid records
- Returns array of patient objects

**Validation:**
- Requires StreetAddress, City, State, ZipCode
- Skips rows with missing required fields

#### `anonymizePatient(patient)`
- Removes PII (FirstName, PhoneNumber, Birthdate)
- Keeps analytical data (distance, revenue, profit)
- Returns sanitized patient object

**Output Format:**
```javascript
{
  systemId: '11409634',
  address: '6120 86th Ave SE, Mercer Island, WA 98040',
  city: 'Mercer Island',
  state: 'WA',
  zipCode: '98040',
  distance: 0.00,
  revenue: '$107.88',
  profit: '($105.60)',
  rxCount: '2',
  maintenanceDrug: 'Yes'
}
```

## Data Flow

### Initial Load

```
1. App mounts
   ↓
2. Load CSV from /public
   ↓
3. Parse CSV (PapaParse)
   ↓
4. Anonymize each record
   ↓
5. Extract unique addresses
   ↓
6. Batch geocode addresses
   ├─ Batch 1 (10 addresses)
   ├─ Progress update (10%)
   ├─ Batch 2 (10 addresses)
   ├─ Progress update (20%)
   └─ ... continue
   ↓
7. Attach coordinates to patients
   ↓
8. Render map with markers
```

### User Interaction

```
User clicks marker
   ↓
setSelectedPatient(marker)
   ↓
InfoWindow renders
   ↓
Display patient details
```

```
User changes visualization mode
   ↓
setVisualizationMode(mode)
   ↓
Map re-renders with new mode
   ├─ clusters: MarkerClusterer + Markers
   ├─ markers: Individual Markers
   └─ heatmap: HeatmapLayer
```

## Performance Optimizations

### Geocoding
- Batch processing (10 at a time)
- Caching (in-memory Map)
- Request deduplication
- Rate limiting to prevent API errors

### Map Rendering
- Marker clustering (default mode)
- Automatic cluster merging at low zoom
- Cluster expansion at high zoom
- Single InfoWindow instance (reused)

### React Optimizations
- `useMemo` for computed values
- `useCallback` for event handlers
- Conditional rendering based on loading state
- Lazy loading of Google Maps libraries

## Google Maps API Configuration

### Required Libraries
```javascript
const libraries = ['visualization', 'places'];
```

- `visualization`: For HeatmapLayer
- `places`: For enhanced geocoding (optional)

### Map Options
```javascript
{
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
}
```

### Cluster Options
```javascript
{
  gridSize: 60,         // Cluster radius in pixels
  maxZoom: 15,          // Max zoom for clustering
  styles: [...]         // Custom cluster styles
}
```

### Heatmap Options
```javascript
{
  radius: 20,           // Point influence radius
  opacity: 0.6,         // Layer transparency
  gradient: [...]       // Color gradient array
}
```

## Error Handling

### API Key Validation
```javascript
if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
  setError('Please set VITE_GOOGLE_MAPS_API_KEY');
}
```

### Geocoding Errors
- Individual address failures logged to console
- Failed addresses skipped (don't block others)
- Status codes handled:
  - `OK`: Success
  - `ZERO_RESULTS`: Address not found
  - Other: API error

### Map Loading Errors
- `loadError` displayed to user
- Includes error message
- Shows setup instructions

## Environment Variables

### VITE_GOOGLE_MAPS_API_KEY
- **Type:** String
- **Required:** Yes
- **Format:** Google Maps API key
- **Security:** Never commit to Git
- **Access:** `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`

## Build Configuration

### Vite Config
```javascript
{
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
}
```

### Build Output
- HTML: `dist/index.html`
- CSS: `dist/assets/*.css`
- JS: `dist/assets/*.js` (code-split)

### Bundle Size
- Total: ~377 KB (gzipped: ~105 KB)
- React: ~140 KB
- Google Maps: ~200 KB
- Application: ~37 KB

## Security Considerations

### Data Privacy
- PII removed before rendering
- No data sent to external services (except Google)
- Geocoding uses only addresses (no names)

### API Key Security
- Stored in `.env` (not committed)
- Can be restricted by domain
- Can be restricted by API
- Recommended: Use separate keys for dev/prod

### HTTPS Requirement
- Google Maps requires HTTPS in production
- `localhost` works with HTTP for development

## Testing Strategy

### Manual Testing
1. Build verification (`npm run build`)
2. Dev server functionality (`npm run dev`)
3. Error handling (missing API key)
4. Map loading
5. Marker interactions
6. Visualization modes
7. Distance filtering

### Future Automated Testing
- Unit tests for utilities (csvParser, geocodingService)
- Component tests for UI (ControlPanel)
- Integration tests for map interactions
- E2E tests with Playwright

## Browser Compatibility

Supported browsers:
- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓

Requirements:
- JavaScript enabled
- LocalStorage available
- WebGL support (for heatmap)

## Future Enhancements

### Technical Improvements
- [ ] Service Worker for offline support
- [ ] IndexedDB for persistent caching
- [ ] WebSocket for real-time updates
- [ ] Progressive Web App (PWA) features

### Performance
- [ ] Virtual scrolling for large datasets
- [ ] Web Worker for geocoding
- [ ] Server-side geocoding (batch)
- [ ] CDN for static assets

### Features
- [ ] Export to PDF/PNG
- [ ] Advanced filtering UI
- [ ] Multiple pharmacy locations
- [ ] Route optimization
- [ ] Statistical overlays

## Maintenance

### Updating Dependencies
```bash
npm update
npm audit fix
```

### Adding New CSV Files
1. Place CSV in `public/` directory
2. Update file path in `App.jsx`
3. Verify column names match expected format

### Changing Map Styles
1. Edit `clusterStyles` in `PatientMap.jsx`
2. Modify `mapOptions` for different controls
3. Adjust `heatmapOptions` for different colors

### API Key Rotation
1. Generate new key in Google Cloud Console
2. Update `.env` file
3. Restart development server
4. No code changes needed

## Troubleshooting

### High API Costs
- Implement server-side geocoding cache
- Pre-geocode addresses in database
- Use Google Maps Platform free tier limits

### Slow Initial Load
- Pre-geocode addresses (one-time)
- Store coordinates in CSV
- Use server-side caching

### Memory Issues
- Clear geocoding cache periodically
- Limit visible markers with distance filter
- Use marker clustering (enabled by default)

## Contact & Support

For technical questions or issues:
1. Check this documentation
2. Review browser console logs
3. Check Google Cloud Console logs
4. Open GitHub issue with details
