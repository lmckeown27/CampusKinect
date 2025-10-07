# Guest Mode Implementation

## Overview
CampusKinect now supports **Guest Mode**, allowing users to browse campus feeds without creating an account. This implementation addresses Apple's App Store Review Guideline 5.1.1(v) requiring apps to offer functionality without requiring account creation.

## User Flow

### First Launch Experience
1. **University Selection**: Users are greeted with a university selection screen
2. **Persistent Selection**: Once a university is selected, it's saved and users won't see the selection screen again
3. **Browse Mode**: Users can browse posts from their selected university
4. **Profile Page**: Clear "Sign In" and "Create Account" buttons are displayed on the profile page
5. **Seamless Conversion**: When users choose to sign up/login, they're taken to existing authentication flows

## Implementation Details

### Web Application

#### 1. Auth Store Updates (`src/stores/authStore.ts`)
Added guest mode state management:
- `isGuest`: Boolean flag for guest mode status
- `guestUniversityId`: Selected university ID
- `guestUniversityName`: Selected university name
- `enterGuestMode()`: Method to activate guest browsing
- `exitGuestMode()`: Method to exit guest mode (called on login)

Guest state persists using localStorage, ensuring university selection is remembered across sessions.

#### 2. Home Page (`src/app/page.tsx`)
Redesigned to support guest mode:
- Checks authentication status on load
- If authenticated → redirect to main feed
- If guest with university → redirect to main feed
- If neither → show university selector
- No "infinite redirect loop" - single decision tree

#### 3. Guest Components

**`GuestProfilePage.tsx`**
- Beautiful profile page for guest users
- Prominent "Create Account" and "Sign In" buttons
- Lists guest capabilities vs. authenticated features
- Shows selected university information
- Educational messaging about joining the community

**`GuestBanner.tsx`**
- Top banner for guest users browsing the feed
- Shows current guest status and selected university
- Quick access to sign in/create account buttons
- Non-intrusive design

**`GuestRestrictionModal.tsx`**
- Appears when guests try restricted actions (like, comment, post, message)
- Clear messaging about why authentication is needed
- Direct links to sign in or create account
- Option to continue browsing without account

**`UniversitySelectModal.tsx`**
- Clean, searchable university list
- University logos/icons for visual appeal
- Saves selection to localStorage
- Only shown once per user (unless they clear data)

#### 4. Profile Tab (`src/components/tabs/ProfileTab.tsx`)
Updated to conditionally render:
- Authenticated users → full profile functionality
- Guest users → `GuestProfilePage` with sign up prompts

### iOS Application

#### 1. AuthenticationManager Updates
**File**: `IOS_CampusKinect/CampusKinect_IOS/Core/Authentication/AuthenticationManager.swift`

Added guest mode properties:
```swift
@Published var isGuest = false
@Published var guestUniversityId: Int?
@Published var guestUniversityName: String?
```

Methods:
- `enterGuestMode(universityId:universityName:)`: Activates guest browsing
- `exitGuestMode()`: Deactivates guest mode (auto-called on login)
- `loadGuestState()`: Loads persisted guest state from UserDefaults
- `saveGuestState()`: Persists guest state

Guest state is automatically saved to UserDefaults using a Codable `GuestState` struct.

#### 2. ContentView (`CampusKinect_IOS/App/ContentView.swift`)
Updated routing logic:
```swift
if authManager.isAuthenticated {
    // Show authenticated MainTabView
} else if authManager.isGuest && authManager.guestUniversityId != nil {
    // Show MainTabView in guest mode
} else {
    // Show UniversitySelectView
}
```

#### 3. Guest Views

**`GuestProfileView.swift`**
Location: `Features/Profile/Views/GuestProfileView.swift`
- Matches iOS design patterns with SwiftUI
- Profile header with guest indicator
- University information display
- Prominent "Create Account" button (primary action)
- "Sign In" button (secondary action)
- Educational cards showing guest vs. authenticated features
- Uses `.sheet` modifiers for login/register navigation

**`UniversitySelectView.swift`**
Location: `Features/Authentication/Views/UniversitySelectView.swift`
- Full-screen university selection interface
- Real-time search filtering
- Beautiful cards for each university
- Fetches universities from backend API
- Immediately activates guest mode on selection
- Persists selection automatically

#### 4. ProfileView (`Features/Profile/Views/ProfileView.swift`)
Updated to show guest profile:
```swift
var body: some View {
    if authManager.isGuest {
        return AnyView(GuestProfileView())
    }
    return AnyView(NavigationStack {
        // Existing profile view
    })
}
```

### Backend Updates

#### 1. Posts Endpoint (`backend/src/routes/posts.js`)
**GET /api/v1/posts/feed** - Now supports guest mode:
- Authentication middleware made optional for GET requests
- If no token provided:
  - Requires `universityId` query parameter
  - Returns posts filtered by university
  - No personalization (no following, no bookmarks)
- If token provided:
  - Existing authenticated behavior (personalized feed)

#### 2. Universities Endpoint
**GET /api/v1/universities**:
- Public endpoint (no authentication required)
- Returns list of all active universities
- Used by guest mode university selector

## Guest Mode Restrictions

### What Guests CAN Do:
✓ Browse posts from selected university
✓ View post content and images
✓ See post categories (Q&A, Events, etc.)
✓ Explore the feed interface
✓ Search universities

### What Guests CANNOT Do:
✗ Create posts
✗ Comment on posts
✗ Like/react to posts
✗ Bookmark posts
✗ Send messages
✗ View their own profile (shows guest profile instead)
✗ Follow users
✗ Report content

When guests attempt restricted actions, they're shown:
1. **Web**: `GuestRestrictionModal` explaining why authentication is needed
2. **iOS**: Native alerts or sheets prompting login/signup

## Data Privacy & Apple Compliance

### Guideline 5.1.1(v) Compliance ✅
> "If your app doesn't include significant account-based features, let people use it without a login."

**Our Implementation**:
- Core feature = browsing campus content → **Available without login**
- Account-based features = posting, messaging → **Clearly optional**
- Clear prompts to create account for enhanced features
- No forced registration

### Guest Mode Privacy Benefits:
1. **No Data Collection**: Guest users' browsing is not tracked
2. **No Personal Information**: Zero personal data required to browse
3. **Anonymous Browsing**: Complete privacy while exploring
4. **Easy Upgrade**: Seamless transition to full account when ready

## User Experience Highlights

### 1. **One-Time Setup**
- University selection shown once
- Persisted across sessions
- Can be changed in settings (future enhancement)

### 2. **Clear Call-to-Action**
- Profile page prominently displays sign-up options
- Guest banner shows persistent access to authentication
- Restriction modals educate about account benefits

### 3. **No Pressure**
- Users can browse indefinitely as guests
- No time limits or "trial" periods
- No nag screens or forced popups

### 4. **Seamless Conversion**
- One tap to sign up or sign in
- Existing authentication flows used
- University preference can be carried over (future enhancement)

## Technical Architecture

### State Management Flow

```
Launch App
    ↓
Check Auth State
    ↓
├─ Authenticated? → Main Feed (Full Features)
├─ Guest + University? → Main Feed (Limited Features)
└─ Neither? → University Selector
    ↓
User Selects University
    ↓
Save to Storage (localStorage/UserDefaults)
    ↓
Enter Guest Mode
    ↓
Show Main Feed (Guest)
    ↓
User Taps "Sign In" → Login Flow → Exit Guest Mode
```

### Data Persistence

**Web (localStorage)**:
```javascript
{
  isGuest: true,
  guestUniversityId: 123,
  guestUniversityName: "Cal Poly"
}
```

**iOS (UserDefaults)**:
```swift
struct GuestState: Codable {
    let isGuest: Bool
    let universityId: Int?
    let universityName: String?
}
```

## Future Enhancements

### Planned Features:
1. **Change University**: Allow guests to switch universities in settings
2. **Remember Interest**: Carry over selected university when creating account
3. **Guest Analytics**: Track anonymous guest engagement (privacy-compliant)
4. **Deep Linking**: Direct links to posts work for guests
5. **Content Preview**: Show post previews before requiring login
6. **Progressive Disclosure**: Gradually introduce features as users browse

### Potential Improvements:
- Guest bookmark (session-only, not persisted)
- Guest "interested" in events (temporary, not saved)
- Guest polls (anonymous voting)
- Guest content suggestions

## Testing Checklist

### Web Application
- [ ] First-time user sees university selector
- [ ] University selection persists across browser sessions
- [ ] Guest can view posts from selected university
- [ ] Profile page shows guest profile with sign-up buttons
- [ ] Attempting to like shows restriction modal
- [ ] Attempting to comment shows restriction modal
- [ ] Guest banner displays correctly on feed
- [ ] Sign in button navigates to login page
- [ ] Create account button navigates to register page
- [ ] Logging in exits guest mode automatically

### iOS Application
- [ ] First-time user sees UniversitySelectView
- [ ] University selection persists across app launches
- [ ] Guest can view posts from selected university
- [ ] Profile tab shows GuestProfileView
- [ ] Attempting to like shows alert
- [ ] Attempting to comment shows alert
- [ ] "Create Account" button opens RegisterView
- [ ] "Sign In" button opens LoginView
- [ ] Logging in exits guest mode automatically
- [ ] App doesn't crash when switching modes

### Backend
- [ ] GET /api/v1/posts/feed works without auth token
- [ ] universityId parameter filters posts correctly
- [ ] GET /api/v1/universities returns university list
- [ ] Authenticated requests still work as before
- [ ] No security vulnerabilities introduced

## Files Changed

### Web Application
```
src/
├── app/
│   └── page.tsx                            # Updated: Default to guest mode
├── components/
│   ├── guest/
│   │   ├── GuestProfilePage.tsx           # NEW: Guest profile with sign-up
│   │   ├── GuestBanner.tsx                # NEW: Guest status banner
│   │   ├── GuestRestrictionModal.tsx      # NEW: Action restriction modal
│   │   └── UniversitySelectModal.tsx      # NEW: University selector
│   └── tabs/
│       └── ProfileTab.tsx                  # Updated: Show guest profile
└── stores/
    └── authStore.ts                        # Updated: Guest mode state
```

### iOS Application
```
CampusKinect_IOS/
├── Core/
│   └── Authentication/
│       └── AuthenticationManager.swift     # Updated: Guest mode support
├── Features/
│   ├── Authentication/
│   │   └── Views/
│   │       └── UniversitySelectView.swift  # NEW: University selector
│   └── Profile/
│       └── Views/
│           ├── GuestProfileView.swift      # NEW: Guest profile
│           └── ProfileView.swift           # Updated: Conditional rendering
└── App/
    └── ContentView.swift                   # Updated: Guest mode routing
```

### Backend
```
backend/
└── src/
    └── routes/
        └── posts.js                        # Updated: Optional auth for GET
```

## Deployment Notes

### Environment Requirements:
- No new environment variables needed
- No database migrations required
- No third-party dependencies added

### Deployment Steps:
1. Deploy backend changes (posts.js)
2. Deploy web application
3. Submit iOS app update to App Store
4. Update App Store description to mention "Browse without account"

### Monitoring:
- Track guest vs. authenticated user ratios
- Monitor conversion rate (guest → registered)
- Analyze which features drive conversion

## Support & Maintenance

### Common Issues:

**"University selection shows every time"**
- Check localStorage/UserDefaults persistence
- Verify guest state is being saved
- Check for privacy/cookie settings blocking storage

**"Guest can't see any posts"**
- Verify university has posts in database
- Check backend universityId filtering logic
- Ensure posts have correct university association

**"Sign up button doesn't work"**
- Verify navigation routing
- Check for modal presentation conflicts
- Ensure LoginView/RegisterView are accessible

### Debug Commands:

**Web (Console)**:
```javascript
// Check guest state
localStorage.getItem('campuskinect-auth-storage')

// Clear guest state
localStorage.removeItem('campuskinect-auth-storage')
```

**iOS (Debugger)**:
```swift
// Check guest state
UserDefaults.standard.data(forKey: "campuskinect_guest_state")

// Clear guest state
UserDefaults.standard.removeObject(forKey: "campuskinect_guest_state")
```

## Conclusion

Guest mode successfully balances user experience, privacy, and App Store compliance. Users can explore CampusKinect without commitment, while still being gently encouraged to join the community for enhanced features. The implementation is clean, maintainable, and sets the foundation for future guest-mode enhancements.
