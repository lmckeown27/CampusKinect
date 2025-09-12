const { query } = require('../config/database');
const { redisGet, redisSet } = require('../config/redis');

class LocationService {
  constructor() {
    this.campusLocations = new Map();
    this.initializeCampusData();
  }

  async initializeCampusData() {
    try {
      // Load campus locations from database or cache
      const cached = await redisGet('campus_locations');
      if (cached) {
        this.campusLocations = new Map(JSON.parse(cached));
        return;
      }

      // Initialize with common campus locations
      await this.seedCampusLocations();
    } catch (error) {
      console.error('Error initializing campus data:', error);
    }
  }

  async seedCampusLocations() {
    const commonLocations = [
      // Academic Buildings
      { name: 'Library', category: 'academic', keywords: ['library', 'study', 'books', 'research'] },
      { name: 'Student Union', category: 'social', keywords: ['union', 'food court', 'events', 'meeting'] },
      { name: 'Engineering Building', category: 'academic', keywords: ['engineering', 'lab', 'computer'] },
      { name: 'Science Building', category: 'academic', keywords: ['science', 'chemistry', 'biology', 'physics'] },
      { name: 'Business Building', category: 'academic', keywords: ['business', 'economics', 'finance'] },
      { name: 'Arts Building', category: 'academic', keywords: ['arts', 'music', 'theater', 'studio'] },
      
      // Residential
      { name: 'North Dorms', category: 'residential', keywords: ['dorm', 'residence', 'housing', 'north'] },
      { name: 'South Dorms', category: 'residential', keywords: ['dorm', 'residence', 'housing', 'south'] },
      { name: 'East Apartments', category: 'residential', keywords: ['apartment', 'housing', 'east'] },
      { name: 'West Apartments', category: 'residential', keywords: ['apartment', 'housing', 'west'] },
      
      // Dining & Services
      { name: 'Main Dining Hall', category: 'dining', keywords: ['dining', 'cafeteria', 'food', 'meal'] },
      { name: 'Campus Store', category: 'services', keywords: ['bookstore', 'supplies', 'merchandise'] },
      { name: 'Health Center', category: 'services', keywords: ['health', 'medical', 'clinic', 'wellness'] },
      { name: 'Fitness Center', category: 'recreation', keywords: ['gym', 'fitness', 'workout', 'recreation'] },
      
      // Outdoor Areas
      { name: 'Main Quad', category: 'outdoor', keywords: ['quad', 'lawn', 'outdoor', 'events'] },
      { name: 'Sports Fields', category: 'recreation', keywords: ['sports', 'field', 'soccer', 'football'] },
      { name: 'Tennis Courts', category: 'recreation', keywords: ['tennis', 'courts', 'sports'] },
      { name: 'Parking Lot A', category: 'parking', keywords: ['parking', 'lot', 'cars', 'vehicles'] },
      { name: 'Parking Lot B', category: 'parking', keywords: ['parking', 'lot', 'cars', 'vehicles'] },
      
      // Study Spaces
      { name: 'Study Lounge', category: 'academic', keywords: ['study', 'lounge', 'quiet', 'group work'] },
      { name: 'Computer Lab', category: 'academic', keywords: ['computer', 'lab', 'technology', 'printing'] },
      { name: 'Tutoring Center', category: 'academic', keywords: ['tutoring', 'help', 'academic support'] }
    ];

    for (const location of commonLocations) {
      this.campusLocations.set(location.name.toLowerCase(), location);
    }

    // Cache the locations
    await redisSet('campus_locations', JSON.stringify([...this.campusLocations]), 86400); // 24 hours
  }

  // Validate and normalize location input
  validateLocation(locationInput, universityId = null) {
    if (!locationInput || typeof locationInput !== 'string') {
      return { isValid: false, error: 'Location must be a non-empty string' };
    }

    const normalized = this.normalizeLocation(locationInput);
    
    // Check if it's a recognized campus location
    const campusLocation = this.findCampusLocation(normalized);
    
    return {
      isValid: true,
      normalized,
      campusLocation,
      category: campusLocation?.category || 'custom',
      isOnCampus: !!campusLocation
    };
  }

  normalizeLocation(location) {
    return location
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  findCampusLocation(normalizedInput) {
    // Direct match
    if (this.campusLocations.has(normalizedInput)) {
      return this.campusLocations.get(normalizedInput);
    }

    // Keyword matching
    for (const [name, location] of this.campusLocations) {
      if (location.keywords.some(keyword => 
        normalizedInput.includes(keyword) || keyword.includes(normalizedInput)
      )) {
        return location;
      }
    }

    return null;
  }

  // Get location suggestions based on partial input
  getLocationSuggestions(partialInput, limit = 10) {
    if (!partialInput || partialInput.length < 2) {
      return [];
    }

    const normalized = this.normalizeLocation(partialInput);
    const suggestions = [];

    for (const [name, location] of this.campusLocations) {
      const score = this.calculateLocationScore(normalized, name, location);
      if (score > 0) {
        suggestions.push({
          name: this.capitalizeLocation(name),
          category: location.category,
          score
        });
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ name, category }) => ({ name, category }));
  }

  calculateLocationScore(input, locationName, location) {
    let score = 0;

    // Exact match
    if (locationName === input) return 100;

    // Starts with
    if (locationName.startsWith(input)) score += 80;

    // Contains
    if (locationName.includes(input)) score += 60;

    // Keyword matches
    for (const keyword of location.keywords) {
      if (keyword === input) score += 90;
      if (keyword.startsWith(input)) score += 70;
      if (keyword.includes(input)) score += 50;
      if (input.includes(keyword)) score += 40;
    }

    return score;
  }

  capitalizeLocation(location) {
    return location
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Process location data from mobile camera metadata
  async processLocationFromCamera(cameraMetadata, userId) {
    try {
      const locationData = {
        hasGPS: false,
        coordinates: null,
        estimatedLocation: null,
        confidence: 0
      };

      // Extract GPS coordinates if available
      if (cameraMetadata.location) {
        locationData.hasGPS = true;
        locationData.coordinates = {
          latitude: cameraMetadata.location.latitude,
          longitude: cameraMetadata.location.longitude,
          accuracy: cameraMetadata.location.accuracy || null
        };

        // Try to match coordinates to campus locations
        const campusMatch = await this.matchCoordinatesToCampus(
          locationData.coordinates, 
          userId
        );

        if (campusMatch) {
          locationData.estimatedLocation = campusMatch.location;
          locationData.confidence = campusMatch.confidence;
        }
      }

      // Extract location from EXIF data if available
      if (cameraMetadata.exif && cameraMetadata.exif.location) {
        // Process EXIF location data
        locationData.exifLocation = this.processExifLocation(cameraMetadata.exif.location);
      }

      return locationData;
    } catch (error) {
      console.error('Error processing camera location:', error);
      return { hasGPS: false, coordinates: null, estimatedLocation: null, confidence: 0 };
    }
  }

  async matchCoordinatesToCampus(coordinates, userId) {
    try {
      // Get user's university for campus boundary checking
      const userResult = await query(
        'SELECT university_id FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) return null;

      // For now, implement basic distance-based matching
      // In production, you'd have actual campus coordinate boundaries
      const campusCenter = await this.getCampusCenter(userResult.rows[0].university_id);
      
      if (!campusCenter) return null;

      const distance = this.calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        campusCenter.latitude,
        campusCenter.longitude
      );

      // If within campus radius (e.g., 2km), try to identify specific location
      if (distance <= 2) {
        return {
          location: 'On Campus',
          confidence: Math.max(0, 100 - (distance * 50)), // Closer = higher confidence
          distance
        };
      }

      return null;
    } catch (error) {
      console.error('Error matching coordinates to campus:', error);
      return null;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  async getCampusCenter(universityId) {
    try {
      // This would typically come from a campus coordinates database
      // For now, return a default center point
      const campusCenters = {
        1: { latitude: 35.3050, longitude: -120.6625 }, // Cal Poly SLO example
        // Add more universities as needed
      };

      return campusCenters[universityId] || null;
    } catch (error) {
      console.error('Error getting campus center:', error);
      return null;
    }
  }

  processExifLocation(exifLocation) {
    // Process EXIF GPS data
    return {
      latitude: exifLocation.GPSLatitude || null,
      longitude: exifLocation.GPSLongitude || null,
      altitude: exifLocation.GPSAltitude || null,
      timestamp: exifLocation.GPSTimeStamp || null
    };
  }

  // Get popular locations for a university
  async getPopularLocations(universityId, limit = 20) {
    try {
      const result = await query(`
        SELECT 
          location,
          COUNT(*) as usage_count,
          COUNT(DISTINCT user_id) as unique_users
        FROM posts 
        WHERE location IS NOT NULL 
        AND location != ''
        AND user_id IN (
          SELECT id FROM users WHERE university_id = $1
        )
        AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY location
        ORDER BY usage_count DESC, unique_users DESC
        LIMIT $2
      `, [universityId, limit]);

      return result.rows.map(row => ({
        name: row.location,
        usageCount: parseInt(row.usage_count),
        uniqueUsers: parseInt(row.unique_users),
        category: this.findCampusLocation(this.normalizeLocation(row.location))?.category || 'custom'
      }));
    } catch (error) {
      console.error('Error getting popular locations:', error);
      return [];
    }
  }

  // Validate location for post creation
  async validatePostLocation(location, userId, postType = null) {
    const validation = this.validateLocation(location);
    
    if (!validation.isValid) {
      return validation;
    }

    // Additional validation based on post type
    if (postType === 'housing' && validation.category === 'academic') {
      return {
        isValid: false,
        error: 'Housing posts should specify residential areas or off-campus locations',
        suggestion: 'Try "North Dorms", "Off-Campus", or a specific address'
      };
    }

    if (postType === 'events' && !validation.isOnCampus) {
      // Events can be off-campus, but suggest campus locations
      const suggestions = this.getLocationSuggestions(location, 3);
      if (suggestions.length > 0) {
        validation.suggestions = suggestions;
      }
    }

    return validation;
  }

  // Get location analytics for admin/insights
  async getLocationAnalytics(universityId, timeframe = '7 days') {
    try {
      const result = await query(`
        SELECT 
          location,
          COUNT(*) as post_count,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(engagement_score) as avg_engagement,
          array_agg(DISTINCT category) as categories
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE u.university_id = $1
        AND p.location IS NOT NULL
        AND p.location != ''
        AND p.created_at >= NOW() - INTERVAL $2
        GROUP BY location
        ORDER BY post_count DESC
      `, [universityId, timeframe]);

      return result.rows.map(row => ({
        location: row.location,
        postCount: parseInt(row.post_count),
        uniqueUsers: parseInt(row.unique_users),
        avgEngagement: parseFloat(row.avg_engagement) || 0,
        categories: row.categories,
        campusCategory: this.findCampusLocation(this.normalizeLocation(row.location))?.category
      }));
    } catch (error) {
      console.error('Error getting location analytics:', error);
      return [];
    }
  }
}

module.exports = new LocationService(); 