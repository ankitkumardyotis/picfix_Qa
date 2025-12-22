// Location Tracking Utility
// Handles IP extraction and geolocation using ipapi.co

/**
 * Extract user IP address from request headers
 * @param {Object} req - Next.js request object
 * @returns {string} User IP address
 */
export function getUserIP(req) {
  // Handle various proxy headers
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  return req.headers['x-real-ip'] || 
         req.headers['cf-connecting-ip'] || // Cloudflare
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         req.ip ||
         '127.0.0.1';
}

/**
 * Get location data from IP address using ipapi.co
 * @param {string} ipAddress - IP address to lookup
 * @returns {Object} Location data or null if failed
 */
export async function getLocationFromIP(ipAddress) {
  // Skip localhost and private IPs
  if (ipAddress === '127.0.0.1' || 
      ipAddress === '::1' || 
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.')) {
    return {
      ip: ipAddress,
      country: 'Local',
      region: 'Local',
      city: 'Localhost',
      timezone: 'Local',
      latitude: null,
      longitude: null,
      countryCode: 'LOCAL',
      isLocal: true
    };
  }

  try {
    // Using ipapi.co free tier (1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'PicFix.AI/1.0'
      },
      timeout: 5000 // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      throw new Error(data.reason || 'API Error');
    }
    
    return {
      ip: data.ip || ipAddress,
      country: data.country_name || 'Unknown',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      timezone: data.timezone || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      countryCode: data.country_code || null,
      isLocal: false
    };
  } catch (error) {
    console.error('Error fetching location from ipapi.co:', error);
    
    // Fallback: try ip-api.com (backup service)
    try {
      const fallbackResponse = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,timezone,lat,lon,countryCode,query`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.status === 'success') {
          return {
            ip: fallbackData.query || ipAddress,
            country: fallbackData.country || 'Unknown',
            region: fallbackData.regionName || 'Unknown',
            city: fallbackData.city || 'Unknown',
            timezone: fallbackData.timezone || null,
            latitude: fallbackData.lat || null,
            longitude: fallbackData.lon || null,
            countryCode: fallbackData.countryCode || null,
            isLocal: false,
            source: 'fallback'
          };
        }
      }
    } catch (fallbackError) {
      console.error('Fallback location service also failed:', fallbackError);
    }
    
    // Return basic data if all services fail
    return {
      ip: ipAddress,
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: null,
      latitude: null,
      longitude: null,
      countryCode: null,
      isLocal: false,
      error: error.message
    };
  }
}

/**
 * Get and cache location data for a request
 * @param {Object} req - Next.js request object
 * @returns {Object} Location data
 */
export async function getRequestLocation(req) {
  const ip = getUserIP(req);
  const location = await getLocationFromIP(ip);
  
  // Add request timestamp
  location.requestTime = new Date().toISOString();
  
  return location;
}
