const { query } = require('../config/database');
const axios = require('axios');

/**
 * Educational Domain Validation Service
 * Covers 5 major first-world countries with smart validation
 * Tries APIs first, falls back to pattern recognition
 */

class EducationalDomainService {
  constructor() {
    // Major first-world country educational domains
    this.knownPatterns = {
      'US': ['.edu'],
      'UK': ['.ac.uk'],
      'Canada': ['.ca'], // Most Canadian universities use .ca
      'Australia': ['.edu.au'],
      'Germany': ['.de'], // German universities use .de
      'France': ['.fr'] // French universities use .fr
    };
    
    // Common university name patterns (minimal set)
    this.universityPatterns = [
      /university/i,
      /college/i,
      /institute/i
    ];
  }

  /**
   * Validate if an email domain is educational
   * @param {string} email - Email to validate
   * @returns {Object} Validation result with country and confidence
   */
  async validateEducationalDomain(email) {
    try {
      const domain = email.split('@')[1];
      
      // First: Check our database for known universities
      const knownUniversity = await this.checkKnownUniversity(domain);
      if (knownUniversity) {
        return {
          isValid: true,
          country: knownUniversity.country,
          university: knownUniversity.name,
          confidence: 'high',
          source: 'database'
        };
      }

      // Second: Try external validation APIs
      const apiValidation = await this.checkExternalAPIs(domain);
      if (apiValidation.isValid) {
        // Auto-add to our database
        await this.addNewUniversity(domain, apiValidation);
        return {
          isValid: true,
          country: apiValidation.country,
          university: apiValidation.university,
          confidence: 'high',
          source: 'api'
        };
      }

      // Third: Pattern matching fallback
      const patternValidation = this.validateByPattern(domain);
      if (patternValidation.isValid) {
        return {
          isValid: true,
          country: patternValidation.country,
          university: null,
          confidence: 'medium',
          source: 'pattern',
          needsVerification: true
        };
      }

      return {
        isValid: false,
        confidence: 'low',
        source: 'none'
      };

    } catch (error) {
      console.error('Error validating educational domain:', error);
      // Fallback to basic pattern check
      return this.validateByPattern(email.split('@')[1]);
    }
  }

  /**
   * Check if domain exists in our database
   */
  async checkKnownUniversity(domain) {
    try {
      const result = await query(
        'SELECT name, country FROM universities WHERE domain = $1 AND is_active = true',
        [domain]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking known university:', error);
      return null;
    }
  }

  /**
   * Try external validation APIs
   */
  async checkExternalAPIs(domain) {
    try {
      // Try multiple API sources in parallel
      const [whois, dns, geo] = await Promise.allSettled([
        this.checkWhoisAPI(domain),
        this.checkDNSAPI(domain),
        this.checkGeolocationAPI(domain)
      ]);

      // If any API confirms it's educational, accept it
      if (whois.status === 'fulfilled' && whois.value.isValid) return whois.value;
      if (dns.status === 'fulfilled' && dns.value.isValid) return dns.value;
      if (geo.status === 'fulfilled' && geo.value.isValid) return geo.value;

      return { isValid: false };
    } catch (error) {
      console.error('Error checking external APIs:', error);
      return { isValid: false };
    }
  }

  /**
   * Check WHOIS data for educational indicators
   */
  async checkWhoisAPI(domain) {
    try {
      // Simple WHOIS check - many universities have "EDU" in their WHOIS data
      const response = await axios.get(`https://whois.whoisxmlapi.com/api/v1?apiKey=${process.env.WHOIS_API_KEY}&domainName=${domain}`);
      if (response.status === 200) {
        const data = response.data;
        const whoisText = JSON.stringify(data).toLowerCase();
        
        // Look for educational indicators
        const eduIndicators = ['university', 'college', 'institute', 'academic', 'education'];
        const hasEduIndicator = eduIndicators.some(indicator => whoisText.includes(indicator));
        
        if (hasEduIndicator) {
          return {
            isValid: true,
            country: this.detectCountryFromWHOIS(data),
            university: domain,
            source: 'whois'
          };
        }
      }
      return { isValid: false };
    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Check DNS records for educational indicators
   */
  async checkDNSAPI(domain) {
    try {
      // Check if domain has educational DNS patterns
      const response = await axios.get(`https://dns.google/resolve?name=${domain}&type=A`);
      if (response.status === 200) {
        const data = response.data;
        
        // If domain resolves and has educational patterns, consider it valid
        if (data.Answer && this.hasEducationalPatterns(domain)) {
          return {
            isValid: true,
            country: this.detectCountryFromDomain(domain),
            university: domain,
            source: 'dns'
          };
        }
      }
      return { isValid: false };
    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Check geolocation for country validation
   */
  async checkGeolocationAPI(domain) {
    try {
      // Use free geolocation service
      const response = await axios.get(`https://ipapi.co/${domain}/json/`);
      if (response.status === 200) {
        const data = response.data;
        
        // Check if it's from a first-world country
        const firstWorldCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'NL', 'SE', 'CH'];
        if (firstWorldCountries.includes(data.country_code)) {
          return {
            isValid: true,
            country: data.country_code,
            university: domain,
            source: 'geolocation'
          };
        }
      }
      return { isValid: false };
    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Pattern-based validation fallback
   */
  validateByPattern(domain) {
    // Check known country patterns
    for (const [country, patterns] of Object.entries(this.knownPatterns)) {
      if (patterns.some(pattern => domain.endsWith(pattern))) {
        return {
          isValid: true,
          country,
          university: null,
          confidence: 'medium',
          source: 'pattern'
        };
      }
    }

    // Check for university name patterns
    const hasUniversityPattern = this.universityPatterns.some(pattern => 
      pattern.test(domain)
    );

    if (hasUniversityPattern) {
      const country = this.detectCountryFromDomain(domain);
      return {
        isValid: true,
        country,
        university: null,
        confidence: 'low',
        source: 'pattern',
        needsVerification: true
      };
    }

    return { isValid: false };
  }

  /**
   * Detect country from domain patterns
   */
  detectCountryFromDomain(domain) {
    if (domain.endsWith('.edu')) return 'US';
    if (domain.endsWith('.ac.uk')) return 'UK';
    if (domain.endsWith('.ca')) return 'Canada';
    if (domain.endsWith('.edu.au')) return 'Australia';
    if (domain.endsWith('.de')) return 'Germany';
    if (domain.endsWith('.fr')) return 'France';
    
    // Default to US for unknown patterns
    return 'US';
  }

  /**
   * Detect country from WHOIS data
   */
  detectCountryFromWHOIS(whoisData) {
    // Extract country from WHOIS response
    const countryCode = whoisData.countryCode || whoisData.registrantCountry;
    if (countryCode) return countryCode;
    
    // Fallback to domain-based detection
    return 'US';
  }

  /**
   * Check if domain has educational patterns
   */
  hasEducationalPatterns(domain) {
    return this.universityPatterns.some(pattern => pattern.test(domain));
  }

  /**
   * Add new university to database
   */
  async addNewUniversity(domain, validationData) {
    try {
      await query(`
        INSERT INTO universities (name, domain, city, state, country, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
        ON CONFLICT (domain) DO UPDATE SET
          country = EXCLUDED.country,
          is_active = true
      `, [validationData.university || domain, domain, 'Unknown', 'Unknown', validationData.country]);
      
      console.log(`✅ Added new university: ${domain} (${validationData.country})`);
    } catch (error) {
      console.error('Error adding new university:', error);
    }
  }

  /**
   * Get all supported countries
   */
  getSupportedCountries() {
    return Object.keys(this.knownPatterns);
  }

  /**
   * Get educational domains for a specific country
   */
  getCountryPatterns(country) {
    return this.knownPatterns[country] || [];
  }
}

module.exports = new EducationalDomainService(); 