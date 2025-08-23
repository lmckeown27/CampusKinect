// University Configuration
// This file configures the primary university for the app
// Currently restricted to Cal Poly SLO only for cost/data management
// Future expansion can modify this to support multiple universities

const PRIMARY_UNIVERSITY = {
  id: 11,
  name: 'California Polytechnic State University, San Luis Obispo',
  domain: 'calpoly.edu',
  city: 'San Luis Obispo',
  state: 'CA',
  country: 'USA',
  abbreviation: 'Cal Poly SLO'
};

// University-specific settings
const UNIVERSITY_CONFIG = {
  // Primary university ID for current single-university restriction
  // This can be expanded later to support multiple universities
  primaryUniversityId: PRIMARY_UNIVERSITY.id,
  
  // University name for display purposes
  displayName: PRIMARY_UNIVERSITY.name,
  
  // Domain validation - only allow .calpoly.edu emails
  allowedDomains: ['calpoly.edu'],
  
  // Geographic cluster (for future expansion)
  clusterId: 1, // California cluster
  
  // University-specific features
  features: {
    // Enable/disable features specific to Cal Poly
    housingPosts: true,        // Housing-related posts
    tutoringServices: true,     // Tutoring and academic services
    campusEvents: true,         // Campus events and activities
    buySellTrade: true,         // Buy/sell/trade items
    rideSharing: true,          // Carpool and ride sharing
    studyGroups: true,          // Study group formation
    sportsAndRecreation: true,  // Sports and recreation activities
    greekLife: true,            // Greek life organizations
    careerServices: true,       // Career and internship opportunities
    campusServices: true        // General campus services
  },
  
  // Default tags for Cal Poly
  defaultTags: [
    'Housing',
    'Tutoring',
    'Textbooks',
    'Electronics',
    'Furniture',
    'Transportation',
    'Study Groups',
    'Campus Events',
    'Sports',
    'Greek Life',
    'Career',
    'Other'
  ],
  
  // Academic calendar settings (for future event scheduling)
  academicCalendar: {
    quarters: true, // Cal Poly uses quarter system
    currentQuarter: 'Fall 2024',
    nextQuarter: 'Winter 2025'
  }
};

// Helper functions
const isPrimaryUniversity = (universityId) => {
  return universityId === UNIVERSITY_CONFIG.primaryUniversityId;
};

const getPrimaryUniversity = () => {
  return PRIMARY_UNIVERSITY;
};

const validateUniversityEmail = (email) => {
  const domain = email.split('@')[1];
  return UNIVERSITY_CONFIG.allowedDomains.includes(domain);
};

module.exports = {
  PRIMARY_UNIVERSITY,
  UNIVERSITY_CONFIG,
  isPrimaryUniversity,
  getPrimaryUniversity,
  validateUniversityEmail
}; 