# Guest Mode Restrictions Implementation

## Overview
Comprehensive guest mode restrictions have been implemented across both iOS and Web platforms to ensure guest users can only browse content and cannot perform any account-specific actions. When guests attempt restricted actions, they see clear popups with options to sign in or create an account.

## Restricted Features

### ❌ Features Guests CANNOT Access:
1. **Create Posts** - Cannot create new posts
2. **Send Messages** - Cannot message other users
3. **Repost** - Cannot repost content
4. **Bookmark** - Cannot save posts
5. **Comment** - Cannot comment on posts (if implemented)
6. **Like/React** - Cannot like or react to posts (if implemented)
7. **Any account-specific features**

### ✅ Features Guests CAN Access:
1. **Browse Feed** - Can view posts from selected university
2. **View Content** - Can read posts, see images, view tags
3. **Explore Categories** - Can filter by post categories
4. **See Post Details** - Can view all public post information

## Implementation Details

### iOS Application

#### 1. Tab-Level Restrictions (`MainTabView.swift`)
**Location**: `IOS_CampusKinect/CampusKinect_IOS/Features/Home/Views/MainTabView.swift`

**Implementation**:
- Added `@EnvironmentObject var authManager: AuthenticationManager` to track guest status
- Passed `authManager` to `CustomTabBarController`
- Modified `Coordinator` to intercept tab selection

**Guest Check Logic**:
```swift
// Check if guest user is trying to access restricted features
if parent.authManager.isGuest {
    if tab == .createPost || tab == .messages {
        showGuestRestrictionAlert(for: tab, on: tabBarController)
        return false
    }
}
```

**Alert Implementation**:
- **Title**: "Account Required"
- **Message**: "You need to create an account or sign in to [action]."
- **Buttons**:
  - "Create Account" - Opens RegisterView sheet
  - "Sign In" - Opens LoginView sheet
  - "Continue Browsing" - Dismisses alert

**Actions**:
- Presents LoginView or RegisterView as sheets
- Sheets include `.environmentObject(authManager)` for proper auth flow
- Prevents tab navigation when guest restrictions apply

#### 2. Post Actions Restrictions (`PostCardView.swift`)
**Location**: `IOS_CampusKinect/CampusKinect_IOS/Features/Home/Views/PostCardView.swift`

**State Variables Added**:
```swift
// Guest restriction
@State private var showingGuestRestriction = false
@State private var guestRestrictionAction = ""
@State private var showingLoginView = false
@State private var showingRegisterView = false
```

**Functions Updated**:

**handleMessage():**
```swift
private func handleMessage() {
    // Check for guest restriction
    if authManager.isGuest {
        guestRestrictionAction = "message"
        showingGuestRestriction = true
        return
    }
    // ... existing message logic
}
```

**handleRepost():**
```swift
private func handleRepost() {
    // Check for guest restriction
    if authManager.isGuest {
        guestRestrictionAction = "repost"
        showingGuestRestriction = true
        return
    }
    // ... existing repost logic
}
```

**handleBookmark():**
```swift
private func handleBookmark() {
    // Check for guest restriction
    if authManager.isGuest {
        guestRestrictionAction = "bookmark"
        showingGuestRestriction = true
        return
    }
    // ... existing bookmark logic
}
```

**Alert Modal**:
```swift
.alert("Account Required", isPresented: $showingGuestRestriction) {
    Button("Create Account") {
        showingRegisterView = true
    }
    Button("Sign In") {
        showingLoginView = true
    }
    Button("Continue Browsing", role: .cancel) { }
} message: {
    Text("You need to create an account or sign in to \(guestRestrictionAction) posts.")
}
.sheet(isPresented: $showingLoginView) {
    LoginView()
        .environmentObject(authManager)
}
.sheet(isPresented: $showingRegisterView) {
    RegisterView()
        .environmentObject(authManager)
}
```

### Web Application

#### 1. Navigation-Level Restrictions (`Navigationbar.tsx`)
**Location**: `Web_CampusKinect/src/components/layout/Navigationbar.tsx`

**State Added**:
```typescript
const { isGuest } = useAuthStore();
const [showGuestModal, setShowGuestModal] = useState(false);
const [guestAction, setGuestAction] = useState('');
```

**Click Handler**:
```typescript
const isRestricted = isGuest && (item.name === 'Create Post' || item.name === 'Messages');

const handleClick = (e: React.MouseEvent) => {
  if (isRestricted) {
    e.preventDefault();
    setGuestAction(item.name === 'Create Post' ? 'post' : 'message');
    setShowGuestModal(true);
  }
};
```

**Modal Integration**:
```tsx
<GuestRestrictionModal
  isOpen={showGuestModal}
  onClose={() => setShowGuestModal(false)}
  action={guestAction}
/>
```

**Behavior**:
- Prevents navigation to `/create-post` and `/messages` routes
- Shows `GuestRestrictionModal` with appropriate messaging
- Modal includes "Create Account" and "Sign In" buttons that navigate to auth pages

#### 2. Post Actions Restrictions (`PostCard.tsx`)
**Location**: `Web_CampusKinect/src/components/ui/PostCard.tsx`

**State Added**:
```typescript
const isGuest = useAuthStore(state => state.isGuest);
const [showGuestRestriction, setShowGuestRestriction] = useState(false);
const [guestAction, setGuestAction] = useState('');
```

**Functions Updated**:

**handleBookmark():**
```typescript
const handleBookmark = () => {
  if (isGuest) {
    setGuestAction('bookmark');
    setShowGuestRestriction(true);
    return;
  }
  setIsBookmarked(!isBookmarked);
};
```

**handleMessage():**
```typescript
const handleMessage = () => {
  if (isGuest) {
    setGuestAction('message');
    setShowGuestRestriction(true);
    return;
  }
  // ... existing message logic
};
```

**handleRepost():**
```typescript
const handleRepost = () => {
  if (isGuest) {
    setGuestAction('repost');
    setShowGuestRestriction(true);
    return;
  }
  // ... existing repost logic
};
```

**Modal Integration**:
```tsx
<GuestRestrictionModal
  isOpen={showGuestRestriction}
  onClose={() => setShowGuestRestriction(false)}
  action={guestAction}
/>
```

## User Experience Flow

### iOS User Flow
```
Guest User Browses Feed
    ↓
Taps "Create Post" Tab
    ↓
iOS Alert Appears:
  Title: "Account Required"
  Message: "You need to create an account or sign in to create posts."
  Buttons:
    [Create Account] → Opens RegisterView
    [Sign In] → Opens LoginView
    [Continue Browsing] → Dismisses alert
    ↓
User chooses action:
    → Create Account → Full registration flow
    → Sign In → Login flow
    → Continue Browsing → Stays in guest mode
```

### Web User Flow
```
Guest User Browses Feed
    ↓
Clicks "Create Post" Nav Item
    ↓
Modal Appears:
  Title: "Account Required"
  Message: "You need to create an account or sign in to post."
  Buttons:
    [Create Account] → Navigates to /auth/register
    [Sign In] → Navigates to /auth/login
    [Continue Browsing] → Closes modal
    ↓
User chooses action:
    → Create Account → Registration page
    → Sign In → Login page
    → Continue Browsing → Stays on current page
```

## Restriction Points Summary

### iOS
| Feature | Restriction Point | Alert Type | Actions Available |
|---------|------------------|------------|-------------------|
| Create Post | Tab selection | Native Alert | Create Account, Sign In, Continue Browsing |
| Messages Tab | Tab selection | Native Alert | Create Account, Sign In, Continue Browsing |
| Repost | Button action | Native Alert | Create Account, Sign In, Continue Browsing |
| Bookmark | Button action | Native Alert | Create Account, Sign In, Continue Browsing |
| Message | Button action | Native Alert | Create Account, Sign In, Continue Browsing |

### Web
| Feature | Restriction Point | Modal Type | Actions Available |
|---------|------------------|------------|-------------------|
| Create Post Nav | Navigation click | React Modal | Create Account, Sign In, Continue Browsing |
| Messages Nav | Navigation click | React Modal | Create Account, Sign In, Continue Browsing |
| Repost | Button action | React Modal | Create Account, Sign In, Continue Browsing |
| Bookmark | Button action | React Modal | Create Account, Sign In, Continue Browsing |
| Message | Button action | React Modal | Create Account, Sign In, Continue Browsing |

## Modal/Alert Design

### iOS Alert (UIAlertController)
- **Style**: `.alert` (standard iOS alert)
- **Title**: "Account Required"
- **Message**: Dynamic based on action (e.g., "You need to create an account or sign in to [action] posts.")
- **Button Styles**:
  - "Create Account" - `.default` style
  - "Sign In" - `.default` style
  - "Continue Browsing" - `.cancel` style
- **Presentation**: Modal sheet with full authentication flow

### Web Modal (GuestRestrictionModal)
- **Styling**: Dark theme with brand colors
- **Layout**: Centered modal with overlay
- **Components**:
  - Lock icon
  - Title: "Account Required"
  - Message: Dynamic based on action
  - Three action buttons with distinct styling
- **Behavior**: Prevents background interaction, dismissible

## Testing Checklist

### iOS Testing
- [ ] Guest user taps "Create Post" tab → Alert shows
- [ ] Guest user taps "Messages" tab → Alert shows
- [ ] Guest user taps repost on post → Alert shows
- [ ] Guest user taps bookmark on post → Alert shows
- [ ] Guest user taps message on post → Alert shows
- [ ] "Create Account" button opens RegisterView
- [ ] "Sign In" button opens LoginView
- [ ] "Continue Browsing" dismisses alert
- [ ] After successful login, restrictions are removed
- [ ] Authenticated users don't see alerts

### Web Testing
- [ ] Guest user clicks "Create Post" nav → Modal shows
- [ ] Guest user clicks "Messages" nav → Modal shows
- [ ] Guest user clicks repost on post → Modal shows
- [ ] Guest user clicks bookmark on post → Modal shows
- [ ] Guest user clicks message on post → Modal shows
- [ ] "Create Account" navigates to /auth/register
- [ ] "Sign In" navigates to /auth/login
- [ ] "Continue Browsing" closes modal
- [ ] After successful login, restrictions are removed
- [ ] Authenticated users can access all features

## Edge Cases Handled

1. **Double-tap prevention**: Loading states prevent multiple simultaneous requests
2. **Auth state changes**: Restrictions automatically lift when user logs in
3. **Guest state persistence**: Guest restrictions persist across page refreshes
4. **Modal stacking**: Only one restriction modal/alert shows at a time
5. **Navigation blocking**: Prevented actual navigation before showing modal
6. **Sheet presentation**: iOS properly presents auth sheets with environment objects

## Security Considerations

1. **Client-side checks only**: These are UX restrictions, not security measures
2. **Backend validation**: All API endpoints still require authentication
3. **No data exposure**: Guest users can only access public feed data
4. **Session management**: Guest state is clearly separated from authenticated state

## Benefits

### User Experience
- ✅ Clear feedback when attempting restricted actions
- ✅ Easy path to sign up or sign in
- ✅ No confusion about what guests can/cannot do
- ✅ Option to continue browsing without pressure

### Conversion Optimization
- ✅ Gentle nudge to create account
- ✅ Shows value of authenticated features
- ✅ Reduces friction with "Continue Browsing" option
- ✅ Educates users about platform features

### App Store Compliance
- ✅ Demonstrates optional authentication (Apple Guideline 5.1.1(v))
- ✅ Shows clear value of creating account
- ✅ Respects user choice to browse without account
- ✅ Provides legitimate reasons for account creation

## Files Modified

### iOS
```
IOS_CampusKinect/CampusKinect_IOS/Features/Home/Views/
├── MainTabView.swift              # Tab-level restrictions
└── PostCardView.swift             # Post action restrictions
```

### Web
```
Web_CampusKinect/src/components/
├── layout/
│   └── Navigationbar.tsx          # Navigation-level restrictions
└── ui/
    └── PostCard.tsx               # Post action restrictions
```

## Future Enhancements

### Analytics
- Track which features guests attempt most
- Measure conversion rate from restriction alerts
- A/B test different messaging

### Progressive Disclosure
- Show different messages based on guest session length
- Highlight most popular features first
- Personalize restrictions based on browsing behavior

### Smart Prompting
- After X restricted actions, show enhanced signup prompt
- Offer preview of authenticated features
- Temporary bookmark/like (session-only) before prompting

## Conclusion

Guest mode restrictions are now fully implemented across both platforms with consistent UX and clear conversion paths. Users understand what they can and cannot do as guests, and have easy access to sign up or sign in when ready. The implementation balances user freedom (can browse indefinitely) with conversion optimization (clear calls-to-action when attempting restricted features).
