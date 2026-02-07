/**
 * Geocoding service with caching to minimize API calls
 */
class GeocodingService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Geocode an address to lat/lng coordinates
   * @param {string} address - Full address string
   * @returns {Promise<{lat: number, lng: number}>}
   */
  async geocodeAddress(address) {
    // Check cache first
    if (this.cache.has(address)) {
      return this.cache.get(address);
    }

    // Check if request is already pending
    if (this.pendingRequests.has(address)) {
      return this.pendingRequests.get(address);
    }

    // Create new request
    const requestPromise = this.fetchGeocode(address);
    this.pendingRequests.set(address, requestPromise);

    try {
      const result = await requestPromise;
      this.cache.set(address, result);
      return result;
    } finally {
      this.pendingRequests.delete(address);
    }
  }

  async fetchGeocode(address) {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          formatted: data.results[0].formatted_address
        };
      } else if (data.status === 'ZERO_RESULTS') {
        console.warn(`No results found for address: ${address}`);
        return null;
      } else {
        console.error(`Geocoding failed for ${address}: ${data.status}`);
        return null;
      }
    } catch (error) {
      console.error(`Error geocoding address ${address}:`, error);
      return null;
    }
  }

  /**
   * Batch geocode multiple addresses with rate limiting
   * @param {Array<string>} addresses - Array of addresses
   * @param {Function} progressCallback - Called with progress updates
   * @returns {Promise<Map>} - Map of address to coordinates
   */
  async batchGeocode(addresses, progressCallback) {
    const results = new Map();
    const batchSize = 10; // Process 10 at a time
    const delay = 100; // 100ms delay between batches

    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (address) => {
        const coords = await this.geocodeAddress(address);
        if (coords) {
          results.set(address, coords);
        }
        return { address, coords };
      });

      await Promise.all(batchPromises);

      if (progressCallback) {
        const progress = Math.min((i + batchSize) / addresses.length, 1);
        progressCallback(progress, results.size);
      }

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (progressCallback) {
      progressCallback(1, results.size);
    }

    return results;
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize() {
    return this.cache.size;
  }
}

export default GeocodingService;
