# Server-Driven UI Implementation Guide

## Overview

This implementation allows you to update the iOS app's UI/UX, feature flags, themes, and configuration **without going through App Store review**. All changes are controlled through the backend API.

## How It Works

### 1. **Backend Configuration Endpoint**
- **File**: `backend/src/routes/config.js`
- **Endpoint**: `GET /api/v1/config/app?platform=ios&version=1.0.0`
- **Returns**: JSON configuration with all UI/UX settings

### 2. **iOS Configuration Service**
- **Files**: 
  - `IOS_CampusKinect/CampusKinect_IOS/Core/Configuration/AppConfiguration.swift`
  - `IOS_CampusKinect/CampusKinect_IOS/Core/Configuration/ConfigurationService.swift`
  - `IOS_CampusKinect/CampusKinect_IOS/Core/Configuration/ThemeManager.swift`
- **Functionality**: Fetches, caches, and applies server configuration

## What You Can Update Without App Store Review

### ✅ **Colors & Theme**
```json
"colors": {
  "primary": "#708d81",
  "background": "#525252",
  // ... all colors
}
```

### ✅ **Feature Flags**
```json
"features": {
  "messaging": { "enabled": true },
  "posts": { "enabled": true },
  "guestMode": { "enabled": true }
}
```

### ✅ **UI Configuration**
```json
"ui": {
  "homeTab": {
    "showTopUniversities": true,
    "defaultPostsPerPage": 20
  }
}
```

### ✅ **Text/Copy**
```json
"text": {
  "appName": "CampusKinect",
  "homeTabTitle": "Home",
  "signInPrompt": "Sign in to access all features"
}
```

### ✅ **Maintenance Mode**
```json
"maintenance": {
  "enabled": false,
  "message": "We'll be back shortly!"
}
```

### ✅ **Announcements/Banners**
```json
"announcements": [{
  "id": "welcome_2024",
  "type": "info",
  "title": "Welcome!",
  "message": "Check out the new features",
  "dismissible": true
}]
```

## How to Make Changes

### Option 1: Edit the Backend File (Recommended)
1. Open `backend/src/routes/config.js`
2. Modify the `config` object in the `/app` endpoint
3. Commit and push changes
4. Restart the backend server
5. iOS app will fetch new config on next launch or after cache expires

### Option 2: Create a Database-Backed System (Advanced)
Store configuration in PostgreSQL and update via admin panel:
```sql
CREATE TABLE app_configurations (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(20),
  config_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## iOS Integration

### 1. **Access Configuration in Views**

```swift
import SwiftUI

struct MyView: View {
    @StateObject private var config = ConfigurationService.shared
    @StateObject private var theme = ThemeManager.shared
    
    var body: some View {
        VStack {
            Text(config.text?.homeTabTitle ?? "Home")
                .foregroundColor(theme.textColor)
                .font(.title)
        }
        .background(theme.backgroundColor)
    }
}
```

### 2. **Check Feature Flags**

```swift
let config = ConfigurationService.shared

if config.isFeatureEnabled("messaging") {
    // Show messages feature
}

if config.features?.posts.maxImagesPerPost ?? 10 > 5 {
    // Allow more images
}
```

### 3. **Use Dynamic Colors**

```swift
let theme = ThemeManager.shared

Button("Create Post") {
    // Action
}
.background(theme.primaryColor)
.foregroundColor(.white)
.cornerRadius(theme.borderRadiusMD)
```

### 4. **Handle Maintenance Mode**

```swift
if config.isMaintenanceModeActive() {
    MaintenanceView(message: config.configuration?.maintenance.message ?? "Under maintenance")
}
```

## Configuration Refresh

- **Automatic**: Config refreshes based on `configRefreshInterval` (default: 1 hour)
- **Manual**: Call `ConfigurationService.shared.fetchConfiguration()` to force refresh
- **Cached**: Config is cached locally and persists between app launches
- **Fallback**: If server is unreachable, cached config is used

## Testing

### 1. Test Configuration Endpoint
```bash
curl "https://campuskinect.net/api/v1/config/app?platform=ios&version=1.0.0"
```

### 2. Test in iOS Simulator
1. Run the app
2. Check console for config logs:
   - `📡 ConfigurationService: Fetching configuration...`
   - `✅ ConfigurationService: Configuration fetched successfully`
3. Modify backend config
4. Restart app or wait for auto-refresh
5. Verify changes appear

## Best Practices

### ✅ DO:
- Use feature flags for gradual rollouts
- Test configuration changes in staging first
- Keep fallback values in iOS code
- Version your config changes
- Monitor config fetch success rates

### ❌ DON'T:
- Change config structure without updating iOS models
- Remove required fields without app update
- Use config for sensitive data (use environment variables)
- Make breaking changes without versioning

## Apple Guidelines Compliance

This implementation is **100% compliant** with Apple's App Store guidelines because:

- ✅ No executable code is downloaded
- ✅ Only JSON configuration data is fetched
- ✅ All UI logic remains in the app binary
- ✅ Configuration only controls existing features
- ✅ Core functionality doesn't change dynamically

## Force Update Mechanism

The config includes version checking:
```json
{
  "version": "1.0.0",
  "minSupportedVersion": "1.0.0",
  "forceUpdate": false
}
```

If `minSupportedVersion` > current app version, show update prompt.

## Rollback Strategy

If a bad config is deployed:
1. Revert the backend config file
2. Restart backend
3. iOS apps will fetch the rolled-back config
4. Apps using cached bad config will update on next refresh

## Monitoring

Add logging to track:
- Config fetch success/failure rates
- Time since last successful fetch
- Active config version per user
- Feature flag usage

## Example Use Cases

### 1. Change Primary Color
Edit `backend/src/routes/config.js`:
```javascript
colors: {
  primary: '#FF5733', // Changed from #708d81
  // ...
}
```

### 2. Disable a Feature
```javascript
features: {
  messaging: {
    enabled: false, // Temporarily disable messaging
    // ...
  }
}
```

### 3. Update Error Messages
```javascript
text: {
  errors: {
    networkError: 'Connection lost. Check your internet.',
    // ...
  }
}
```

### 4. A/B Testing
```javascript
// For specific user segments, return different configs
if (userSegment === 'beta') {
  config.features.newFeature.enabled = true;
}
```

## Support

For questions or issues:
- Check iOS console logs for configuration errors
- Verify backend endpoint is accessible
- Check backend logs for config request errors
- Ensure JSON structure matches iOS models

## Future Enhancements

Potential improvements:
1. **Admin Dashboard**: UI to edit config without touching code
2. **A/B Testing**: Serve different configs to different user segments
3. **Analytics**: Track feature usage based on flags
4. **Scheduled Changes**: Auto-enable features at specific times
5. **User-Specific Configs**: Personalized configurations
6. **Config History**: Track and rollback config changes

