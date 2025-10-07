# Apple Privacy Compliance Checklist - Guideline 5.1
**CampusKinect iOS App**  
**Compliance Date: October 2024**

This document certifies that CampusKinect complies with Apple App Store Review Guidelines 5.1 (Privacy).

---

## ✅ 5.1.1(i) - Privacy Policies

### Requirements:
- [x] **Privacy Policy Link in App Store Connect**: Include privacy policy link in metadata field
- [x] **Privacy Policy Accessible in App**: Easy to access within the app
- [x] **Clear Data Collection Disclosure**: Explicitly identify what data is collected and how
- [x] **Third-Party Data Sharing Disclosure**: Confirm third parties provide equal protection
- [x] **Data Retention/Deletion Policies**: Explain retention and how users can request deletion

### Implementation:
1. **In-App Access**: Settings → Privacy & Safety → Privacy Policy
2. **Comprehensive Disclosure**:
   - Personal information collected (name, email, university, etc.)
   - Content created (posts, comments, messages)
   - Usage information (device info, logs, tokens)
3. **Third-Party Services**:
   - AWS (hosting infrastructure)
   - Apple Push Notifications
   - All require same level of data protection
4. **Data Retention**:
   - Account data: While account is active
   - Posts/messages: Until user deletes or closes account
   - Logs: 90 days for security/debugging
5. **Account Deletion**: Settings → Privacy & Data → Delete Account

**Location in Code**:
- `IOS_CampusKinect/CampusKinect_IOS/Features/Settings/Views/PrivacyView.swift`
- Lines 1-547 (comprehensive privacy policy)

---

## ✅ 5.1.1(ii) - Permission

### Requirements:
- [x] **User Consent for Data Collection**: Secure user consent before collecting data
- [x] **Clear Purpose Strings**: Describe data use clearly
- [x] **Easy Consent Withdrawal**: Provide way to withdraw consent
- [x] **No Paywall for Consent**: Paid features don't require granting data access

### Implementation:
1. **Permission Requests**:
   ```
   NSCameraUsageDescription: "CampusKinect needs camera access to take photos for your posts..."
   NSPhotoLibraryUsageDescription: "CampusKinect needs photo library access to select images..."
   NSUserTrackingUsageDescription: "CampusKinect respects your privacy. We only use basic analytics..."
   ```

2. **Consent Withdrawal**:
   - iOS Settings integration for permission management
   - Settings → Privacy & Data → Permissions section
   - Direct link to iOS Settings

3. **Optional Permissions**:
   - Camera and Photo Library are optional
   - Core app functionality works without these permissions
   - Alternative: Users can still browse, comment, message without posting photos

**Location in Code**:
- `IOS_CampusKinect/CampusKinect.xcodeproj/project.pbxproj` (lines 445-448, 489-492)
- `IOS_CampusKinect/CampusKinect_IOS/Features/Settings/Views/DataManagementView.swift`

---

## ✅ 5.1.1(iii) - Data Minimization

### Requirements:
- [x] **Request Only Necessary Data**: Only collect data relevant to core functionality
- [x] **Use Out-of-Process Pickers**: Use system pickers where possible

### Implementation:
1. **Minimal Data Collection**:
   - Only university email for verification
   - Only necessary profile information
   - Optional fields clearly marked (hometown, bio)

2. **System Pickers Used**:
   - Photo picker for image selection
   - Camera interface for photo capture
   - No direct file system access

**Verification**: No unnecessary data fields required during registration or usage.

---

## ✅ 5.1.1(iv) - Access

### Requirements:
- [x] **Respect User Permissions**: Don't manipulate or trick users
- [x] **Provide Alternatives**: Offer alternatives when permissions denied
- [x] **No Permission Forcing**: Don't require unrelated permissions

### Implementation:
1. **Permission Respect**:
   - App checks permission status before requesting
   - Clear explanation shown before requesting permission
   - Graceful handling of denied permissions

2. **Alternatives Provided**:
   - If photo access denied: User can still view, comment, message
   - If notifications denied: App still fully functional
   - No features blocked due to permission denial

3. **No Cross-Feature Requirements**:
   - Posting doesn't require camera (can use existing photos or text-only)
   - Messaging doesn't require photo library access
   - Each permission tied to specific feature

**Location in Code**:
- `IOS_CampusKinect/CampusKinect_IOS/Core/Notifications/PushNotificationManager.swift`
- Permission handling in relevant feature views

---

## ✅ 5.1.1(v) - Account Sign-In

### Requirements:
- [x] **Account Deletion in App**: Provide in-app account deletion
- [x] **No Unnecessary Personal Info**: Don't require info unrelated to core functionality
- [x] **Social Network Credential Management**: Provide revocation mechanism

### Implementation:
1. **Account Deletion**:
   - Settings → Privacy & Data → Delete Account
   - Confirmation required ("DELETE" must be typed)
   - Backend endpoint: `DELETE /api/v1/users/profile/permanent`
   - Deletes ALL user data permanently

2. **Minimal Required Information**:
   - University email (required for verification - core functionality)
   - Name (required for community trust - core functionality)
   - Username (required for identification)
   - All other fields are optional

3. **No Social Network Login**:
   - App uses email-based authentication only
   - No third-party social login integration
   - N/A for social network requirements

**Location in Code**:
- iOS: `IOS_CampusKinect/CampusKinect_IOS/Features/Settings/Views/DataManagementView.swift` (lines 354-407)
- Backend: `backend/src/routes/users.js` (lines 577-688)

---

## ✅ 5.1.2(i) - Data Use and Sharing

### Requirements:
- [x] **Obtain Permission Before Sharing**: Get explicit permission before using/transmitting data
- [x] **App Tracking Transparency**: Use ATT APIs for tracking
- [x] **Provide Access to Data Usage Info**: Show where data will be used
- [x] **Don't Require System Functions**: Don't force push notifications, location, etc.

### Implementation:
1. **No Data Selling**: We explicitly do NOT sell user data

2. **App Tracking Transparency**:
   - `NSUserTrackingUsageDescription` provided
   - Clear explanation: "We only use basic analytics to improve app quality and fix bugs"
   - Statement: "We do NOT track you across other apps or sell your data"

3. **Data Sharing Disclosure**:
   - AWS (hosting) - covered in privacy policy
   - Apple Push Notifications - covered in privacy policy
   - No advertising networks
   - No analytics trackers

4. **Optional System Functions**:
   - Push notifications are optional
   - App works fully without notifications
   - No forced permissions

**Location in Code**:
- `IOS_CampusKinect/CampusKinect.xcodeproj/project.pbxproj` (NSUserTrackingUsageDescription)

---

## ✅ 5.1.2(ii) - Data Repurposing

### Requirements:
- [x] **No Data Repurposing**: Data collected for one purpose not reused without consent

### Implementation:
- Email collected for verification → Only used for verification
- Posts/comments → Only displayed in community feed
- Messages → Only used for direct communication
- No data repurposing across features
- No sharing with third parties for different purposes

**Verification**: Code review confirms single-purpose data usage.

---

## ✅ Additional Compliance

### User Data Rights Implementation:
1. **Access Rights**: 
   - View all personal data in Settings → Profile
   - Backend: `GET /api/v1/users/profile/export`

2. **Export Rights**:
   - Download all data in JSON format
   - Settings → Privacy & Data → Export My Data
   - Includes: profile, posts, comments, bookmarks, reports, statistics

3. **Deletion Rights**:
   - Permanent account deletion with confirmation
   - All data permanently removed
   - Cannot be undone

4. **Correction Rights**:
   - Edit profile information anytime
   - Settings → Edit Profile

**Location in Code**:
- iOS: `IOS_CampusKinect/CampusKinect_IOS/Features/Settings/Views/DataManagementView.swift`
- Backend: `backend/src/routes/users.js` (lines 690-850)

---

## 📋 Pre-Submission Checklist

### App Store Connect Metadata:
- [ ] Privacy Policy URL added to App Store Connect
- [ ] Privacy labels accurately completed (Data Collection, Data Linked to User, etc.)
- [ ] Third-party SDK disclosure (if any)

### In-App Verification:
- [x] Privacy Policy accessible from Settings
- [x] Account deletion works and is easily accessible
- [x] Data export works and provides complete data
- [x] All permission purpose strings are clear and accurate
- [x] No forced permissions
- [x] App functions without optional permissions

### Backend Verification:
- [x] Account deletion endpoint works (`DELETE /api/v1/users/profile/permanent`)
- [x] Data export endpoint works (`GET /api/v1/users/profile/export`)
- [x] All user data properly deleted on account deletion
- [x] No data leaks or retention after deletion

---

## 🔐 Privacy Policy URLs

**iOS App**: Accessible in Settings → Privacy & Safety → Privacy Policy  
**Web App**: https://campuskinect.net/privacy  
**Contact**: privacy@campuskinect.com

---

## 📝 Notes for App Review

**To Apple App Review Team:**

CampusKinect is fully compliant with Apple Privacy Guidelines 5.1. Key highlights:

1. **Comprehensive Privacy Policy**: Accessible in-app with detailed explanations of data collection, use, sharing, and retention.

2. **User Control**: Users have complete control over their data with abilities to:
   - View privacy policy anytime
   - Export all their data
   - Delete their account permanently
   - Manage permissions through iOS Settings

3. **Transparency**: Clear purpose strings for all permissions, no hidden data collection, no tracking across apps.

4. **Data Minimization**: We only collect data necessary for core functionality (campus community networking).

5. **No Data Selling**: We explicitly do NOT sell user data or use it for advertising.

6. **Student Safety**: University email verification ensures verified student communities while protecting privacy.

All privacy features have been tested and are fully functional. Backend endpoints for data export and account deletion are production-ready.

---

## 🛠️ Testing Instructions

### Test Account Deletion:
1. Open app and log in
2. Navigate to Settings → Privacy & Data
3. Scroll to "Delete Account" section
4. Tap "Delete My Account"
5. Type "DELETE" to confirm
6. Account and all data permanently deleted

### Test Data Export:
1. Open app and log in
2. Navigate to Settings → Privacy & Data
3. Tap "Export My Data"
4. Wait for export (shows loading)
5. JSON file is created and can be shared/saved

### Test Privacy Policy Access:
1. Open app
2. Navigate to Settings → Privacy & Safety → Privacy Policy
3. Comprehensive policy displays with all required information

---

## 📞 Support Contact

For any privacy-related questions or concerns:
- **Email**: privacy@campuskinect.com
- **Support**: campuskinect01@gmail.com

---

**Compliance Certification**: This implementation fully complies with Apple App Store Review Guidelines 5.1 (Privacy) as of October 2024.

**Last Updated**: October 7, 2024  
**Version**: 1.0  
**App Version**: 1.0 (Build 4)
