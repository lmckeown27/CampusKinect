const { query } = require('../config/database');

/**
 * Timezone Service for handling university-specific time operations
 */
class TimezoneService {
  constructor() {
    // Cache for university timezones to avoid repeated DB queries
    this.timezoneCache = new Map();
  }

  /**
   * Get timezone for a university
   * @param {number} universityId - University ID
   * @returns {Promise<string>} - Timezone string (e.g., 'America/New_York')
   */
  async getUniversityTimezone(universityId) {
    // Check cache first
    if (this.timezoneCache.has(universityId)) {
      return this.timezoneCache.get(universityId);
    }

    try {
      const result = await query(`
        SELECT timezone 
        FROM universities 
        WHERE id = $1 AND is_active = true
      `, [universityId]);

      const timezone = result.rows[0]?.timezone || 'America/Los_Angeles'; // Default fallback
      
      // Cache the result
      this.timezoneCache.set(universityId, timezone);
      
      return timezone;
    } catch (error) {
      console.error('Error fetching university timezone:', error);
      return 'America/Los_Angeles'; // Safe fallback
    }
  }

  /**
   * Convert UTC timestamp to university local time
   * @param {Date|string} utcTimestamp - UTC timestamp
   * @param {number} universityId - University ID
   * @returns {Promise<Date>} - Local time for the university
   */
  async convertToUniversityTime(utcTimestamp, universityId) {
    const timezone = await this.getUniversityTimezone(universityId);
    
    const date = new Date(utcTimestamp);
    
    // Use Intl.DateTimeFormat for timezone conversion
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(date);
  }

  /**
   * Get current time for a university
   * @param {number} universityId - University ID
   * @returns {Promise<Date>} - Current local time for the university
   */
  async getCurrentUniversityTime(universityId) {
    return this.convertToUniversityTime(new Date(), universityId);
  }

  /**
   * Check if a post has expired based on university timezone
   * @param {Date|string} expiresAt - Expiration timestamp
   * @param {number} universityId - University ID
   * @returns {Promise<boolean>} - True if expired
   */
  async isPostExpired(expiresAt, universityId) {
    if (!expiresAt) return false;
    
    const timezone = await this.getUniversityTimezone(universityId);
    const now = new Date();
    const expiration = new Date(expiresAt);
    
    // Convert both to the same timezone for comparison
    const nowInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const expirationInTimezone = new Date(expiration.toLocaleString("en-US", { timeZone: timezone }));
    
    return nowInTimezone >= expirationInTimezone;
  }

  /**
   * Calculate post expiration time in university timezone
   * @param {number} durationHours - Duration in hours
   * @param {number} universityId - University ID
   * @returns {Promise<Date>} - Expiration timestamp in UTC
   */
  async calculatePostExpiration(durationHours, universityId) {
    const timezone = await this.getUniversityTimezone(universityId);
    
    // Get current time in university timezone
    const now = new Date();
    const universityNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    
    // Add duration hours
    universityNow.setHours(universityNow.getHours() + durationHours);
    
    // Convert back to UTC for storage
    return new Date(universityNow.toISOString());
  }

  /**
   * Format timestamp for display in university timezone
   * @param {Date|string} timestamp - Timestamp to format
   * @param {number} universityId - University ID
   * @param {object} options - Formatting options
   * @returns {Promise<string>} - Formatted timestamp
   */
  async formatTimestampForUniversity(timestamp, universityId, options = {}) {
    const timezone = await this.getUniversityTimezone(universityId);
    
    const defaultOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };

    const formatOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('en-US', formatOptions).format(new Date(timestamp));
  }

  /**
   * Clear timezone cache (useful for testing or when universities are updated)
   */
  clearCache() {
    this.timezoneCache.clear();
  }

  /**
   * Get all supported timezones
   * @returns {Array<string>} - Array of supported timezone strings
   */
  getSupportedTimezones() {
    return [
      'America/Los_Angeles',  // Pacific Time
      'America/Denver',       // Mountain Time  
      'America/Chicago',      // Central Time
      'America/New_York',     // Eastern Time
      'America/Anchorage',    // Alaska Time
      'Pacific/Honolulu',     // Hawaii Time
      'America/Detroit',      // Michigan (Eastern)
      'America/Phoenix'       // Arizona (no DST)
    ];
  }
}

// Export singleton instance
module.exports = new TimezoneService(); 