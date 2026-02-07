# Quick Start Guide

This guide will help you get the Patient Location Map running in 5 minutes.

## Prerequisites

- Node.js 16 or higher installed
- Google Cloud Platform account (free tier works)
- Basic familiarity with terminal/command line

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including React, Google Maps libraries, and CSV parser.

## Step 2: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to "APIs & Services" > "Library"
4. Search for and enable:
   - **Maps JavaScript API**
   - **Geocoding API**
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "API Key"
7. Copy your new API key

### Optional but Recommended: Restrict Your API Key

To prevent unauthorized use:

1. Click on your API key in the Credentials page
2. Under "Application restrictions":
   - For development: Choose "HTTP referrers" and add `http://localhost:3000/*`
   - For production: Add your domain
3. Under "API restrictions":
   - Choose "Restrict key"
   - Select "Maps JavaScript API" and "Geocoding API"
4. Click "Save"

## Step 3: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and replace `your_google_maps_api_key_here` with your actual API key:

```
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
```

## Step 4: Start the Application

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

## Step 5: Use the Map

Once loaded, you'll see:

1. **Control Panel** at the top with:
   - Patient count and loading status
   - Visualization mode selector (Clusters, Markers, Heatmap)
   - Distance filter (1-20 miles or all)

2. **Interactive Map** showing:
   - Patient location markers
   - Clusters (in Clusters mode)
   - Heat zones (in Heatmap mode)

3. **Click any marker** to see:
   - System ID
   - City/State
   - Distance from pharmacy
   - Prescription count
   - Revenue and profit

## Common Issues

### "Please set VITE_GOOGLE_MAPS_API_KEY" Error

**Solution**: Make sure:
- You created `.env` file (copy from `.env.example`)
- You added your API key to `.env`
- You restarted the dev server after creating `.env`

### Map Not Loading

**Solution**: 
- Check that both APIs are enabled in Google Cloud Console
- Verify your API key is correct
- Check browser console for specific errors
- Ensure billing is enabled on your Google Cloud account

### Some Addresses Not Geocoding

**Normal behavior**: Some addresses may fail to geocode if they're:
- Invalid or incomplete
- Too ambiguous
- Not in Google's database

The app will skip these and show all successfully geocoded patients.

## Next Steps

- Try different visualization modes to see which works best for your analysis
- Use distance filters to focus on specific patient populations
- Check the main README.md for advanced features and customization options

## Support

If you encounter issues:
1. Check the main README.md troubleshooting section
2. Review browser console for error messages
3. Verify all APIs are enabled in Google Cloud Console
4. Ensure your API key has proper permissions

---

**Estimated First Load Time**: 1-2 minutes (includes geocoding 616 addresses)
**Subsequent Loads**: Instant (addresses are cached by browser)
