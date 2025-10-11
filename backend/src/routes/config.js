const express = require('express');
const router = express.Router();

// @route   GET /api/v1/config/app
// @desc    Get app configuration for client apps (iOS, Android, Web)
// @access  Public
router.get('/app', async (req, res) => {
  try {
    const { platform, version } = req.query;

    // Server-driven UI configuration
    // This can be modified without app store review!
    const config = {
      version: '1.0.0',
      minSupportedVersion: '1.0.0',
      forceUpdate: false,
      
      // Theme Configuration
      theme: {
        colors: {
          primary: '#708d81',
          primaryDark: '#5a7268',
          primaryLight: '#8ba89d',
          secondary: '#708d81',
          background: '#525252',
          backgroundLight: '#1a1a1a',
          backgroundMedium: '#262626',
          text: '#ffffff',
          textSecondary: '#9ca3af',
          border: '#525252',
          error: '#dc2626',
          success: '#10b981',
          warning: '#f59e0b',
          info: '#3b82f6'
        },
        fonts: {
          regular: 'System',
          medium: 'System-Medium',
          semibold: 'System-Semibold',
          bold: 'System-Bold'
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
          xxl: 48
        },
        borderRadius: {
          sm: 4,
          md: 8,
          lg: 12,
          xl: 16,
          full: 9999
        }
      },

      // Feature Flags
      features: {
        messaging: {
          enabled: true,
          maxMessageLength: 1000,
          imageUploadEnabled: true,
          maxImagesPerMessage: 5
        },
        posts: {
          enabled: true,
          maxPostLength: 5000,
          maxImagesPerPost: 10,
          categoriesEnabled: true,
          tagsEnabled: true
        },
        userProfile: {
          enabled: true,
          allowBioEdit: true,
          allowProfilePictureChange: true,
          maxBioLength: 500
        },
        notifications: {
          enabled: true,
          pushEnabled: true
        },
        search: {
          enabled: true,
          minSearchLength: 2,
          maxResults: 50
        },
        admin: {
          enabled: true,
          allowedEmails: ['lmckeown@calpoly.edu'],
          allowedUsernames: ['liam_mckeown38']
        },
        guestMode: {
          enabled: true,
          allowBrowsing: true,
          restrictedFeatures: ['create_post', 'messaging', 'profile_edit']
        }
      },

      // UI Configuration
      ui: {
        homeTab: {
          showTopUniversities: true,
          defaultPostsPerPage: 20,
          refreshInterval: 300000, // 5 minutes
          showFilters: true,
          availableFilters: ['offers', 'requests', 'events']
        },
        createPost: {
          showCategoryPicker: true,
          showTagsPicker: true,
          showLocationField: true,
          requireImage: false,
          showPreview: true
        },
        messages: {
          showTypingIndicator: true,
          showReadReceipts: true,
          maxConversationsToShow: 100,
          enableImageSharing: true
        },
        profile: {
          showStatsCard: true,
          showRecentActivity: true,
          showSettings: true,
          fields: ['bio', 'major', 'year', 'hometown']
        },
        navigation: {
          showHome: true,
          showCreatePost: true,
          showMessages: true,
          showProfile: true,
          bottomNavEnabled: true
        }
      },

      // Text/Copy Configuration
      text: {
        appName: 'CampusKinect',
        tagline: 'Connect with your campus',
        homeTabTitle: 'Home',
        createPostButtonText: 'Create Post',
        messagesTabTitle: 'Messages',
        profileTabTitle: 'Profile',
        guestModeBannerText: 'Browsing as Guest',
        signInPrompt: 'Sign in to access all features',
        errors: {
          networkError: 'Network connection error. Please try again.',
          authError: 'Authentication failed. Please sign in again.',
          genericError: 'Something went wrong. Please try again.'
        }
      },

      // API Configuration
      api: {
        baseURL: 'https://campuskinect.net/api/v1',
        timeout: 30000,
        retryAttempts: 3,
        cacheEnabled: true,
        cacheDuration: 300000 // 5 minutes
      },

      // External Links
      links: {
        termsOfService: 'https://campuskinect.net/terms',
        privacyPolicy: 'https://campuskinect.net/privacy',
        support: 'mailto:support@campuskinect.net',
        website: 'https://campuskinect.net'
      },

      // Platform-specific overrides
      platformOverrides: getPlatformOverrides(platform),

      // Maintenance Mode
      maintenance: {
        enabled: false,
        message: 'CampusKinect is currently undergoing maintenance. We\'ll be back shortly!',
        estimatedEndTime: null
      },

      // Announcements / Banners
      announcements: [
        // {
        //   id: 'welcome_2024',
        //   type: 'info',
        //   title: 'Welcome to CampusKinect!',
        //   message: 'Discover a new way to connect with your campus community.',
        //   dismissible: true,
        //   priority: 1
        // }
      ],

      // Remote Config Refresh Interval (in seconds)
      configRefreshInterval: 3600 // Check for config updates every hour
    };

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error fetching app configuration:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch app configuration'
      }
    });
  }
});

// Helper function to get platform-specific overrides
function getPlatformOverrides(platform) {
  const overrides = {};

  switch (platform) {
    case 'ios':
      overrides.features = {
        notifications: {
          pushEnabled: true,
          apnsEnabled: true
        }
      };
      overrides.ui = {
        navigation: {
          useSFSymbols: true,
          tabBarStyle: 'material'
        }
      };
      break;

    case 'android':
      overrides.features = {
        notifications: {
          pushEnabled: true,
          fcmEnabled: true
        }
      };
      overrides.ui = {
        navigation: {
          useMaterialIcons: true,
          bottomNavEnabled: true
        }
      };
      break;

    case 'web':
      overrides.ui = {
        navigation: {
          sidebarEnabled: true,
          responsiveBreakpoint: 768
        }
      };
      break;
  }

  return overrides;
}

module.exports = router;

