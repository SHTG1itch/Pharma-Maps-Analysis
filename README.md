# Pharma Maps Analysis - Patient Location Visualization

An interactive React application that visualizes patient locations from CSV data using Google Maps API. This tool helps analyze patient distribution, identify clusters, and understand geographic patterns for pharmaceutical operations.

## Features

- **Interactive Map Visualization**: Display patient locations on an interactive Google Map
- **Multiple Visualization Modes**:
  - **Clusters**: Automatically groups nearby patients for better performance and readability
  - **Individual Markers**: Shows each patient as a separate marker
  - **Heat Map**: Visualizes patient density using color gradients
- **Data Privacy**: Automatically anonymizes patient data (removes names, phone numbers, birthdates)
- **Filtering**: Filter patients by distance from the pharmacy
- **Detailed Info Windows**: Click markers to see anonymized patient information
- **Performance Optimized**: Efficiently handles large datasets with caching and batch geocoding
- **Configurable**: Easy to update with new CSV files or adjust parameters

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Google Cloud Platform account with billing enabled
- Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Geocoding API

## Getting Started

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. (Optional but recommended) Restrict your API key:
   - HTTP referrers for Maps JavaScript API
   - IP addresses for Geocoding API

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Google Maps API key:
```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4. Run the Application

Development mode with hot reload:
```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## How It Works

### Data Flow

1. **CSV Parsing**: The application reads `patients by distance to store.csv` and parses patient records
2. **Anonymization**: Removes sensitive information (names, phone numbers, birthdates)
3. **Geocoding**: Converts addresses to latitude/longitude coordinates using Google Geocoding API
4. **Caching**: Stores geocoded addresses to minimize API calls
5. **Visualization**: Renders patients on Google Maps with chosen visualization mode

### CSV Format

The application expects a CSV file with the following columns:
- `StreetAddress`: Patient street address
- `City`: City name
- `State`: State abbreviation
- `ZipCode`: ZIP code
- `Distance`: Distance from pharmacy in miles
- `Revenue`: Revenue from patient
- `Profit`: Profit from patient
- `Textbox36`: Prescription count
- `MaintenanceDrugIndicator`: Whether patient uses maintenance drugs
- `SystemID`: Internal system identifier

**Note**: The first two rows of the CSV are treated as metadata and skipped during parsing.

## Using Your Own Data

To use a different patient dataset:

1. Prepare your CSV file with the required columns (see above)
2. Place the CSV file in the `public/` directory
3. Update the file path in `src/App.jsx`:
   ```javascript
   const rawPatients = await parsePatientCSV('/your-file-name.csv');
   ```
4. Restart the development server

## Features Breakdown

### Visualization Modes

**Clusters Mode** (Default)
- Groups nearby patients into clusters
- Shows count badge on cluster markers
- Best for overview of patient distribution
- Automatic zoom handling

**Individual Markers Mode**
- Shows each patient as a separate marker
- Good for detailed analysis
- May be slower with very large datasets

**Heat Map Mode**
- Visualizes patient density with color gradients
- Blue to red color scale
- Best for identifying high-density areas

### Distance Filtering

Use the "Max Distance" dropdown to filter patients:
- All Distances: Shows all patients
- Within 1-20 miles: Shows only patients within selected distance

### Patient Information

Click any marker to see anonymized patient details:
- System ID (anonymized identifier)
- City and State
- Distance from pharmacy
- Prescription count
- Revenue and Profit
- Maintenance drug indicator

## Performance Considerations

### Geocoding

- The application uses batch geocoding with rate limiting
- Addresses are cached to prevent duplicate API calls
- Progress bar shows geocoding status
- Approximately 10 addresses geocoded per second

### Map Rendering

- Marker clustering automatically enabled for better performance
- Clusters adapt to zoom level
- Maximum 15 zoom level for clusters (auto-expands beyond that)

## Privacy & Security

The application implements several privacy protections:

1. **Data Anonymization**: Automatically removes:
   - Patient names
   - Phone numbers
   - Birthdates

2. **Retained Information** (for analysis):
   - System ID (internal identifier)
   - Address (for mapping only)
   - Distance, revenue, profit (aggregate metrics)
   - Prescription counts

3. **Best Practices**:
   - Never commit `.env` file with API keys
   - Restrict API keys in Google Cloud Console
   - Don't share anonymized data without proper authorization

## Troubleshooting

### "Please set VITE_GOOGLE_MAPS_API_KEY" Error
- Make sure you created `.env` file (copy from `.env.example`)
- Ensure your API key is correctly set in `.env`
- Restart the development server after changing `.env`

### Geocoding Failures
- Check that Geocoding API is enabled in Google Cloud Console
- Verify your API key has permission to use Geocoding API
- Check browser console for specific error messages
- Some addresses may fail if they're invalid or ambiguous

### Map Not Loading
- Check that Maps JavaScript API is enabled
- Verify your API key in Google Cloud Console
- Check browser console for error messages
- Ensure you have billing enabled on your Google Cloud account

### Slow Performance
- Try using "Clusters" visualization mode
- Filter by distance to reduce visible markers
- Check your internet connection
- Clear browser cache

## Future Enhancements

Potential features for future development:

- [ ] Export map as image or PDF for reports
- [ ] Advanced filtering by patient type, profit, revenue
- [ ] Date range filtering
- [ ] Draw custom regions for analysis
- [ ] Calculate driving distances vs straight-line distances
- [ ] Integration with pharmacy management systems
- [ ] Real-time data updates
- [ ] Multiple pharmacy locations support
- [ ] Custom marker colors based on profit/revenue
- [ ] Statistical analysis overlays

## Project Structure

```
pharma-maps-analysis/
├── public/
│   └── (static assets)
├── src/
│   ├── components/
│   │   ├── PatientMap.jsx        # Main map component
│   │   └── ControlPanel.jsx      # UI controls
│   ├── services/
│   │   └── geocodingService.js   # Geocoding API integration
│   ├── utils/
│   │   └── csvParser.js          # CSV parsing & anonymization
│   ├── App.jsx                   # Main application
│   ├── App.css                   # Styles
│   └── main.jsx                  # Entry point
├── patients by distance to store.csv  # Sample data
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── vite.config.js                # Vite configuration
└── README.md                     # This file
```

## Technologies Used

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **@react-google-maps/api**: Google Maps integration
- **PapaParse**: CSV parsing library
- **Google Maps JavaScript API**: Map rendering
- **Google Geocoding API**: Address to coordinates conversion

## License

ISC

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Open an issue on GitHub with detailed information

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Note**: This application is designed for internal pharmaceutical analysis and should be used in compliance with HIPAA and other relevant privacy regulations. Always ensure proper authorization before analyzing patient data.
