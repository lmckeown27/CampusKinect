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

      // Post Categories and Tags
      // This allows you to add/remove/modify categories and tags without App Store review
      categories: {
        goodsServices: {
          id: 'goods-services',
          name: 'Goods/Services',
          description: 'Posts for goods, services, and general campus needs',
          icon: '🛍️',
          subCategories: {
            // SERVICES SUBCATEGORIES (these map to Services category in iOS)
            haircut: {
              id: 'haircut',
              name: 'Haircut & Grooming',
              description: 'Haircut, barber, and grooming services',
              icon: '✂️',
              tags: ['haircut', 'barber', 'salon', 'grooming', 'hairstyling']
            },
            transportation: {
              id: 'transportation',
              name: 'Transportation',
              description: 'Rides, carpooling, and transportation services',
              icon: '🚗',
              tags: ['ride', 'carpool', 'transport', 'drive', 'travel', 'uber', 'lyft']
            },
            tutoring: {
              id: 'tutoring',
              name: 'Tutoring',
              description: 'Academic help and tutoring services',
              icon: '📚',
              tags: ['tutoring', 'homework', 'study', 'academic', 'math', 'science', 'english', 'writing']
            },
            fitness_training: {
              id: 'fitness_training',
              name: 'Fitness Training',
              description: 'Personal training and fitness coaching',
              icon: '💪',
              tags: ['fitness', 'training', 'gym', 'workout', 'exercise', 'coaching']
            },
            cleaning: {
              id: 'cleaning',
              name: 'Cleaning',
              description: 'Cleaning and maintenance services',
              icon: '🧹',
              tags: ['cleaning', 'laundry', 'maintenance', 'housekeeping']
            },
            tech_support: {
              id: 'tech_support',
              name: 'Tech Support',
              description: 'Technology and IT support services',
              icon: '💻',
              tags: ['tech support', 'IT', 'computer', 'repair', 'software', 'hardware']
            },
            // HOUSING SUBCATEGORIES
            leasing: {
              id: 'leasing',
              name: 'Leasing',
              description: 'Housing and apartment leasing',
              icon: '🏠',
              tags: ['housing', 'apartment', 'lease', 'rent']
            },
            roommate_search: {
              id: 'roommate_search',
              name: 'Roommate Search',
              description: 'Find roommates and shared housing',
              icon: '👥',
              tags: ['roommate', 'shared', 'housing']
            },
            subleasing: {
              id: 'subleasing',
              name: 'Subleasing',
              description: 'Sublet and short-term housing',
              icon: '🔑',
              tags: ['sublet', 'sublease', 'short-term']
            },
            // GOODS SUBCATEGORIES
            furniture: {
              id: 'furniture',
              name: 'Furniture',
              description: 'Furniture and home items',
              icon: '🛋️',
              tags: ['furniture', 'couch', 'desk', 'chair', 'table']
            },
            electronics: {
              id: 'electronics',
              name: 'Electronics',
              description: 'Electronics and tech gadgets',
              icon: '📱',
              tags: ['electronics', 'phone', 'laptop', 'tablet', 'gadget']
            },
            books: {
              id: 'books',
              name: 'Books',
              description: 'Textbooks and reading materials',
              icon: '📖',
              tags: ['textbook', 'book', 'reading', 'course', 'education']
            },
            other: {
              id: 'other',
              name: 'Other',
              description: 'Miscellaneous goods and services',
              icon: '🔧',
              tags: ['other', 'misc', 'help', 'request']
            }
          }
        },
        events: {
          id: 'events',
          name: 'Events',
          description: 'Campus events and activities',
          icon: '📅',
          subCategories: {
            sport: {
              id: 'sport',
              name: 'Sports',
              description: 'Athletic events and activities',
              icon: '⚽',
              tags: ['sport', 'athletic', 'game', 'tournament', 'fitness', 'basketball', 'football', 'soccer', 'tennis']
            },
            rush: {
              id: 'rush',
              name: 'Rush',
              description: 'Greek life and recruitment',
              icon: '🎓',
              tags: ['rush', 'greek', 'fraternity', 'sorority', 'recruitment']
            },
            philanthropy: {
              id: 'philanthropy',
              name: 'Philanthropy',
              description: 'Charity and community service',
              icon: '❤️',
              tags: ['philanthropy', 'charity', 'community', 'service', 'volunteer']
            },
            academic: {
              id: 'academic',
              name: 'Academic',
              description: 'Academic events and workshops',
              icon: '🎓',
              tags: ['academic', 'lecture', 'workshop', 'seminar', 'conference']
            },
            social: {
              id: 'social',
              name: 'Social',
              description: 'Social events and parties',
              icon: '🎉',
              tags: ['social', 'party', 'club', 'entertainment', 'music']
            },
            cultural: {
              id: 'cultural',
              name: 'Cultural',
              description: 'Cultural and diversity events',
              icon: '🌍',
              tags: ['cultural', 'diversity', 'heritage', 'international', 'celebration']
            }
          }
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
      configRefreshInterval: 300 // Check for config updates every 5 minutes (was 3600/1 hour)
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

