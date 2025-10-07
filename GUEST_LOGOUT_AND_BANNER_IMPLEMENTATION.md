# Guest Mode Logout & University Banner Implementation

## Overview
Enhanced the guest mode experience with two key features:
1. **Logout to Guest Mode**: Users who log out now return to guest mode (not forced to login)
2. **Guest University Banner**: Clear banner showing which university guests are viewing with ability to switch

## Features Implemented

### 1. Logout Behavior Change

#### Previous Behavior:
- User logs out → redirected to login screen
- Lost context of browsing session
- Forced to authenticate to continue browsing

#### New Behavior:
- User logs out → enters guest mode
- Preserves selected university (if any)
- Continues browsing without interruption
- University selection persists

### 2. Guest University Banner

Similar to the admin university switcher, guests now have a prominent banner showing:
- **Current university** being viewed
- **"Switch" button** to change universities
- **Visual indicator** (eye icon) that they're in guest mode
- **Modal selector** with search functionality

## Implementation Details

### iOS Application

#### 1. Logout to Guest Mode (`AuthenticationManager.swift`)
**Location**: `IOS_CampusKinect/CampusKinect_IOS/Core/Authentication/AuthenticationManager.swift`

**Changes to `logout()` function**:
```swift
func logout() async {
    isLoading = true
    
    // Save current guest university if exists (to preserve selection)
    let savedUniversityId = guestUniversityId
    let savedUniversityName = guestUniversityName
    
    // Clear tokens from keychain
    let tokensCleared = await keychainManager.clearAllTokens()
    
    // Clear authentication state
    isAuthenticated = false
    currentUser = nil
    authError = nil
    
    // Enter guest mode with preserved university
    if let universityId = savedUniversityId, let universityName = savedUniversityName {
        enterGuestMode(universityId: universityId, universityName: universityName)
        print("👤 Logout: Re-entered guest mode with saved university")
    } else {
        // No saved university - will show selector
        isGuest = false
        guestUniversityId = nil
        guestUniversityName = nil
        saveGuestState()
    }
    
    NotificationCenter.default.post(name: .userDidLogout, object: nil)
    isLoading = false
}
```

**Key Points**:
- Preserves `guestUniversityId` and `guestUniversityName` before logout
- Calls `enterGuestMode()` to restore guest state
- If no university exists, clears guest state (will show UniversitySelectView)
- Saves guest state to UserDefaults for persistence

#### 2. Guest University Banner (`GuestUniversityBanner.swift`)
**Location**: `IOS_CampusKinect/CampusKinect_IOS/Features/Home/Views/GuestUniversityBanner.swift`

**Components**:

**GuestUniversityBanner**:
- Eye icon + "Browsing as Guest" text
- University name display
- "Switch" button to change universities
- Blue theme matching guest mode aesthetic

**UniversitySwitcherView**:
- Full-screen modal with navigation
- Shows current university at top
- Search bar with real-time filtering
- Scrollable list of all universities
- Selected university indicated with checkmark and "Current" badge
- Cancel button to dismiss

**UniversitySwitcherRow**:
- University icon (building or checkmark if selected)
- University name and domain
- Visual distinction for currently selected university
- Tap to switch

**Features**:
```swift
- @State private var showingUniversitySelector = false
- @State private var universities: [University] = []
- @State private var searchText = ""
- Real-time search filtering
- Fetches universities via APIService.shared.fetchUniversities()
- Calls authManager.enterGuestMode() on selection
- Dismisses modal automatically after selection
```

#### 3. Added to HomeView (`HomeView.swift`)
**Location**: `IOS_CampusKinect/CampusKinect_IOS/Features/Home/Views/HomeView.swift`

**Integration**:
```swift
// Guest University Banner
if authManager.isGuest,
   let universityName = authManager.guestUniversityName,
   let universityId = authManager.guestUniversityId {
    GuestUniversityBanner(
        universityName: universityName,
        universityId: universityId
    )
    .padding(.horizontal)
    .padding(.top, 8)
}
```

**Placement**: Positioned after admin university banner, before posts list

### Web Application

#### 1. Logout to Guest Mode (`authStore.ts`)
**Location**: `Web_CampusKinect/src/stores/authStore.ts`

**Changes to `logout()` function**:
```typescript
logout: (redirectCallback?: () => void) => {
  try {
    // Save current guest university selection to preserve it
    const currentState = get();
    const savedUniversityId = currentState.guestUniversityId;
    const savedUniversityName = currentState.guestUniversityName;
    
    // Call API logout
    apiService.logout();
    
    // Clear authentication state but enter guest mode
    if (savedUniversityId && savedUniversityName) {
      // Restore previous guest university selection
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null,
        isLoading: false,
        isGuest: true,
        guestUniversityId: savedUniversityId,
        guestUniversityName: savedUniversityName
      });
      console.log('👤 Logout: Re-entered guest mode');
    } else {
      // No saved university - will show selector
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null,
        isLoading: false,
        isGuest: false,
        guestUniversityId: null,
        guestUniversityName: null
      });
    }
    
    if (redirectCallback) {
      redirectCallback();
    }
  } catch (error) {
    // Error handling with same logic
  }
}
```

**Key Points**:
- Uses Zustand's `get()` to access current state
- Preserves university selection through logout
- Sets `isGuest: true` and restores university info
- Persists to localStorage automatically via Zustand persist middleware

#### 2. Guest University Banner (`GuestUniversityBanner.tsx`)
**Location**: `Web_CampusKinect/src/components/guest/GuestUniversityBanner.tsx`

**Components**:

**Main Banner**:
```tsx
- Eye icon + "Browsing as Guest" text
- University name display  
- "Switch" button with RefreshCw icon
- Blue theme with opacity for subtle look
- Rounded corners and border
```

**University Switcher Modal**:
```tsx
- Full-screen overlay with backdrop
- Modal with header, search, and list
- Shows "Currently Viewing" indicator
- Search bar with clear button
- Scrollable university list
- Selected university highlighted with checkmark
- "Current" badge on selected university
- Loading spinner while fetching
- Empty state with search icon
```

**State Management**:
```typescript
const [showSwitcher, setShowSwitcher] = useState(false);
const [universities, setUniversities] = useState<University[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

**Features**:
- Fetches universities via `apiService.fetchUniversities()`
- Real-time search filtering (name and domain)
- Calls `enterGuestMode()` from authStore on selection
- Auto-closes modal after selection
- Responsive design

#### 3. Added to HomeTab (`HomeTab.tsx`)
**Location**: `Web_CampusKinect/src/components/tabs/HomeTab.tsx`

**Integration**:
```tsx
{/* Guest University Banner */}
{isGuest && guestUniversityName && guestUniversityId && (
  <div className="px-4 pt-4">
    <GuestUniversityBanner />
  </div>
)}
```

**Placement**: After admin university banner, before category header

**Import Added**:
```typescript
import GuestUniversityBanner from '../guest/GuestUniversityBanner';
```

**useAuthStore Updated**:
```typescript
const { user, isGuest, guestUniversityName, guestUniversityId } = useAuthStore();
```

## User Experience Flow

### Logout Flow
```
Authenticated User
      ↓
Clicks "Logout"
      ↓
System Preserves:
  - guestUniversityId
  - guestUniversityName
      ↓
Clears Auth Tokens
      ↓
Enters Guest Mode with Saved University
      ↓
Returns to Feed (Guest View)
      ↓
Guest University Banner Visible
```

### University Switching Flow
```
Guest Browsing Feed
      ↓
Sees Banner: "Browsing as Guest - [University Name]"
      ↓
Clicks "Switch" Button
      ↓
Modal Opens with:
  - Current university highlighted
  - Search bar
  - List of all universities
      ↓
User Searches/Selects University
      ↓
enterGuestMode() called
      ↓
Modal Closes
      ↓
Feed Refreshes with New University
      ↓
Banner Updates to Show New University
```

## Banner Design

### iOS Design
```
┌─────────────────────────────────────────┐
│ 👁️  Browsing as Guest             ┌────┐│
│     Cal Poly                      │Switch││
│                                    └────┘│
└─────────────────────────────────────────┘
```

**Styling**:
- Blue color scheme (`Color.blue`)
- Eye icon (SF Symbol `eye.fill`)
- Semi-transparent background
- Border with blue tint
- Rounded corners (12pt radius)

### Web Design
```
┌─────────────────────────────────────────┐
│ 👁️  Browsing as Guest             ┌────┐│
│     Cal Poly                      │🔄Switch││
│                                    └────┘│
└─────────────────────────────────────────┘
```

**Styling**:
- Blue theme with opacity (`bg-blue-900 bg-opacity-20`)
- Border (`border-2 border-blue-500`)
- Eye icon (Lucide `Eye`)
- RefreshCw icon on button
- Rounded corners (`rounded-lg`)

## Benefits

### User Experience
✅ **Seamless Logout**: No forced authentication after logout  
✅ **Context Preservation**: University selection maintained  
✅ **Easy Discovery**: Banner clearly shows current context  
✅ **Quick Switching**: One-tap access to change universities  
✅ **Search Functionality**: Find universities quickly  
✅ **Visual Clarity**: Obvious guest mode indication

### App Store Compliance
✅ **Non-Admin University Switching**: Only guests and admins can switch (addresses requirement)  
✅ **Clear Context**: Always know which university you're viewing  
✅ **Optional Authentication**: Reinforces that login is optional  
✅ **Transparent Experience**: No hidden behavior

### Conversion Optimization
✅ **Lower Exit Rate**: Users don't leave after logout  
✅ **Continued Engagement**: Can keep browsing other universities  
✅ **Exploration Encouraged**: Easy to try different campuses  
✅ **Natural Re-engagement**: May return to sign up later

## Testing Checklist

### iOS Testing
- [ ] User logs out → enters guest mode
- [ ] University selection preserved through logout
- [ ] Guest banner appears in HomeView
- [ ] Banner shows correct university name
- [ ] "Switch" button opens UniversitySwitcherView
- [ ] Search filters universities correctly
- [ ] Selecting university updates feed
- [ ] Current university shows checkmark + "Current" badge
- [ ] Modal dismisses after selection
- [ ] Feed refreshes with new university posts
- [ ] Banner updates to show new university

### Web Testing
- [ ] User logs out → enters guest mode
- [ ] University selection preserved through logout
- [ ] Guest banner appears in HomeTab
- [ ] Banner shows correct university name
- [ ] "Switch" button opens modal
- [ ] Search filters universities correctly
- [ ] Selecting university updates feed
- [ ] Current university highlighted with checkmark
- [ ] Modal closes after selection
- [ ] Feed refreshes with new university posts
- [ ] Banner updates to show new university
- [ ] Works on mobile and desktop

### Edge Cases
- [ ] Logout when no guest university → shows UniversitySelectView
- [ ] Switching while posts are loading
- [ ] Search with no results
- [ ] Very long university names (truncation)
- [ ] Rapid university switching
- [ ] Network error during university fetch

## API Integration

### Endpoints Used

**Fetch Universities**:
- **Endpoint**: `GET /api/v1/universities`
- **Authentication**: None required (public endpoint)
- **Returns**: `{ data: University[] }`
- **University Schema**:
  ```typescript
  {
    id: number;
    name: string;
    domain: string;
  }
  ```

**Fetch Posts (Guest)**:
- **Endpoint**: `GET /api/v1/posts/feed?universityId={id}`
- **Authentication**: None required for guests
- **Returns**: Posts filtered by university
- **Behavior**: Automatically uses `guestUniversityId` when in guest mode

## Files Modified

### iOS
```
IOS_CampusKinect/CampusKinect_IOS/
├── Core/Authentication/
│   └── AuthenticationManager.swift       # Updated logout() for guest mode
├── Features/Home/Views/
│   ├── GuestUniversityBanner.swift       # NEW: Banner with switcher
│   └── HomeView.swift                    # Added banner display
```

### Web
```
Web_CampusKinect/src/
├── stores/
│   └── authStore.ts                      # Updated logout() for guest mode
├── components/
│   ├── guest/
│   │   └── GuestUniversityBanner.tsx     # NEW: Banner with switcher
│   └── tabs/
│       └── HomeTab.tsx                   # Added banner display
```

## Comparison with Admin Switcher

| Feature | Admin Switcher | Guest Switcher |
|---------|---------------|----------------|
| **Who Can Use** | Admins only | Guests only |
| **Indicator** | "Admin Mode" tag | "Browsing as Guest" + eye icon |
| **Color** | Green (`#708d81`) | Blue |
| **Reset/Switch** | "View All Universities" | "Switch" with modal |
| **Persistence** | Session (localStorage) | Persists through logout |
| **Search** | No search | Full search functionality |
| **Selection UI** | Admin panel | Modal with search |

## Future Enhancements

### Planned
1. **Recently Viewed**: Show last 3 universities visited
2. **Popular Universities**: Highlight most active campuses
3. **University Stats**: Show post count for each
4. **Favorites**: Let guests bookmark universities
5. **Nearby Universities**: Geo-location based suggestions

### Potential
- University logos/icons in switcher
- Quick-switch dropdown (no modal)
- Compare feed between universities
- University-specific trending tags
- Guest university history

## Security Considerations

1. **No Privileged Access**: Guests can only view public feed data
2. **Rate Limiting**: University switching should be rate-limited
3. **Validation**: University ID validated on backend
4. **No Data Leaks**: Guests can't access restricted university data
5. **State Isolation**: Guest state separate from auth state

## Conclusion

The logout-to-guest-mode and guest university banner features significantly enhance the guest experience by:
- Removing friction when logging out
- Providing clear context about what they're viewing
- Enabling easy exploration of different universities
- Maintaining engagement after logout
- Complying with App Store guidelines

These changes make CampusKinect more accessible and user-friendly for guest users while still encouraging eventual account creation.
