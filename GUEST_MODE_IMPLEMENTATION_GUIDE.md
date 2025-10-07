# CampusKinect Guest Mode Implementation Guide
**Status**: Backend Complete, Frontend In Progress  
**Created**: October 7, 2024

## 🎯 Overview

This guide documents the implementation of Guest Mode for CampusKinect to potentially enhance compliance with Apple Guideline 5.1.1(v).

### ⚠️ Important Note

**CampusKinect may already be compliant** with Guideline 5.1.1(v) as it IS a social networking platform similar to Facebook/Instagram, where account creation is fundamental to core functionality. The guideline specifically states: *"If your core app functionality is not related to a specific social network... you must provide access without a login."*

Since CampusKinect IS a social network for university students, the account requirement is likely acceptable. **However, Guest Mode can improve onboarding and user experience.**

---

## ✅ COMPLETED: Backend Implementation

### 1. Optional Authentication Middleware
**File**: `backend/src/middleware/optionalAuth.js`

```javascript
// Allows requests to proceed with or without authentication
// Sets req.isGuest = true if no valid token
// Used for endpoints that support both guest and authenticated users
```

**Features**:
- Checks for JWT token in headers or cookies
- If no token → marks as guest, continues request
- If invalid/expired token → treats as guest
- If valid token → attaches user data to request

### 2. Guest Routes
**File**: `backend/src/routes/guest.js`

**Endpoints**:
```
GET /api/v1/guest/universities
- Returns list of all active universities
- Fields: id, name, domain, city, state, country
- Used to populate university selection modal

GET /api/v1/guest/university/:id
- Returns single university details
- Includes student_count and post_count
- Used for university info display
```

### 3. Posts Endpoint Updated
**File**: `backend/src/routes/posts.js` (lines 40-58)

**Changes**:
```javascript
// Now accepts universityId query parameter for guests
GET /api/v1/posts/organized?universityId=X

// Logic:
- If authenticated → use user's university
- If guest + universityId provided → use that university
- Default → Cal Poly SLO
```

### 4. Server Registration
**File**: `backend/src/server.js`

- Guest routes registered at `/api/v1/guest`
- Available without authentication

---

## ✅ COMPLETED: Web Frontend Foundation

### 1. University Select Modal
**File**: `Web_CampusKinect/src/components/guest/UniversitySelectModal.tsx`

**Features**:
- Beautiful modal with search functionality
- Fetches universities from `/api/v1/guest/universities`
- Displays city/state information
- Search by name, city, or state
- Responsive design matching app theme

**Usage**:
```typescript
<UniversitySelectModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSelect={(university) => {
    enterGuestMode(university.id, university.name);
  }}
/>
```

### 2. Auth Store with Guest Mode
**File**: `Web_CampusKinect/src/stores/authStore.ts`

**New State**:
```typescript
interface AuthState {
  // Existing...
  isGuest: boolean;
  guestUniversityId: number | null;
  guestUniversityName: string | null;
}
```

**New Actions**:
```typescript
enterGuestMode(universityId, universityName)
exitGuestMode()
```

**Persistence**: Guest state saved to localStorage

---

## 📋 REMAINING TASKS

### For Web App:

#### 1. Guest Profile Page
**File to Create**: `Web_CampusKinect/src/app/guest-profile/page.tsx`

**Requirements**:
```typescript
- Display: "Guest" as name
- University: Show guestUniversityName
- Message: "Log in or sign up to access your profile"
- Buttons: [Login] [Create Account]
- Disable all profile features (edit, posts, etc.)
```

#### 2. Restriction Modal
**File to Create**: `Web_CampusKinect/src/components/guest/GuestRestrictionModal.tsx`

**Trigger on**:
- Like button click
- Comment button click
- Create post button click
- Message button click
- Bookmark button click

**Display**:
```
Title: "Account Required"
Message: "You need to create an account or log in to use this feature."
Buttons: [Login] [Sign Up] [Cancel]
```

#### 3. Guest Mode Banner
**File to Create**: `Web_CampusKinect/src/components/guest/GuestBanner.tsx`

```typescript
<GuestBanner universityName={guestUniversityName} />

// Displays at top of feed:
"You're browsing as a guest | Viewing: [University Name] | [Login] [Sign Up]"
```

#### 4. Update HomePage
**File**: `Web_CampusKinect/src/app/page.tsx`

**Current**:
```typescript
export default function HomePage() {
  redirect('/auth/login');  // Always redirects
}
```

**Updated**:
```typescript
export default function HomePage() {
  const { isAuthenticated, isGuest } = useAuthStore();
  
  if (isAuthenticated) {
    redirect('/home');
  } else if (isGuest) {
    redirect('/guest-feed');
  } else {
    // Show university select modal
    return <UniversitySelectPage />;
  }
}
```

#### 5. Create Guest Feed Page
**File to Create**: `Web_CampusKinect/src/app/guest-feed/page.tsx`

```typescript
'use client';

export default function GuestFeedPage() {
  const { guestUniversityId, guestUniversityName } = useAuthStore();
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    // Fetch posts WITHOUT auth token
    fetch(`/api/v1/posts/organized?universityId=${guestUniversityId}`)
      .then(res => res.json())
      .then(data => setPosts(data.data));
  }, [guestUniversityId]);
  
  return (
    <>
      <GuestBanner universityName={guestUniversityName} />
      <PostFeed posts={posts} readOnly={true} />
    </>
  );
}
```

---

### For iOS App:

#### 1. Update AuthenticationManager
**File**: `IOS_CampusKinect/CampusKinect_IOS/Core/Authentication/AuthenticationManager.swift`

**Add**:
```swift
@Published var isGuest: Bool = false
@Published var guestUniversityId: Int? = nil
@Published var guestUniversityName: String? = nil

func enterGuestMode(universityId: Int, universityName: String) {
    self.isGuest = true
    self.guestUniversityId = universityId
    self.guestUniversityName = universityName
    self.isAuthenticated = false
}

func exitGuestMode() {
    self.isGuest = false
    self.guestUniversityId = nil
    self.guestUniversityName = nil
}
```

#### 2. Create UniversitySelectView
**File to Create**: `IOS_CampusKinect/CampusKinect_IOS/Features/Guest/UniversitySelectView.swift`

```swift
struct UniversitySelectView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var universities: [University] = []
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            List(filteredUniversities) { university in
                Button(action: {
                    authManager.enterGuestMode(
                        universityId: university.id,
                        universityName: university.name
                    )
                }) {
                    UniversityRow(university: university)
                }
            }
            .searchable(text: $searchText)
            .navigationTitle("Select University")
        }
    }
}
```

#### 3. Create GuestProfileView
**File to Create**: `IOS_CampusKinect/CampusKinect_IOS/Features/Guest/GuestProfileView.swift`

```swift
struct GuestProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 80))
            
            Text("Guest")
                .font(.title)
            
            Text("Browsing as Guest")
                .foregroundColor(.secondary)
            
            if let universityName = authManager.guestUniversityName {
                Text("Viewing: \(universityName)")
                    .font(.caption)
            }
            
            Button("Log In") {
                // Navigate to login
            }
            .buttonStyle(.borderedProminent)
            
            Button("Create Account") {
                // Navigate to register
            }
            .buttonStyle(.bordered)
        }
    }
}
```

#### 4. Update ContentView
**File**: `IOS_CampusKinect/CampusKinect_IOS/App/ContentView.swift`

```swift
var body: some View {
    ZStack {
        if authManager.isLoading {
            LoadingView()
        } else if authManager.isAuthenticated {
            MainTabView()
        } else if authManager.isGuest {
            GuestMainTabView() // New guest version
        } else {
            UniversitySelectView() // Show instead of LoginView
        }
    }
}
```

#### 5. Create GuestMainTabView
**File to Create**: `IOS_CampusKinect/CampusKinect_IOS/Features/Guest/GuestMainTabView.swift`

```swift
struct GuestMainTabView: View {
    var body: some View {
        TabView {
            GuestFeedView()
                .tabItem {
                    Label("Feed", systemImage: "house")
                }
            
            GuestProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
        }
    }
}
```

#### 6. Create GuestFeedView
**File to Create**: `IOS_CampusKinect/CampusKinect_IOS/Features/Guest/GuestFeedView.swift`

```swift
struct GuestFeedView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var posts: [Post] = []
    @State private var showRestrictionAlert = false
    
    var body: some View {
        NavigationView {
            VStack {
                // Guest banner
                GuestBanner(universityName: authManager.guestUniversityName ?? "")
                
                // Post feed (read-only)
                ScrollView {
                    ForEach(posts) { post in
                        PostCard(post: post, readOnly: true)
                            .onTapGesture {
                                showRestrictionAlert = true
                            }
                    }
                }
            }
            .alert("Account Required", isPresented: $showRestrictionAlert) {
                Button("Log In") { /* Navigate */ }
                Button("Sign Up") { /* Navigate */ }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Create an account or log in to interact with posts.")
            }
        }
        .onAppear {
            loadGuestPosts()
        }
    }
    
    func loadGuestPosts() {
        // Fetch without auth token
        // Add universityId query parameter
    }
}
```

---

## 🔧 Implementation Strategy

### Recommended Approach:

1. **Test Backend** (Already Complete)
   ```bash
   # Test guest routes
   curl https://campuskinect.net/api/v1/guest/universities
   
   # Test guest posts
   curl "https://campuskinect.net/api/v1/posts/organized?universityId=1"
   ```

2. **Complete Web App** (Easier to test)
   - Create Guest Profile Page
   - Create Restriction Modal
   - Update HomePage
   - Create Guest Feed
   - Test full flow

3. **Complete iOS App** (Similar to web)
   - Follow same pattern as web
   - Use SwiftUI equivalents
   - Test on simulator

---

## 🎯 Guest Mode User Flow

### First Launch:
```
1. User opens app
2. See University Select screen
3. Search and select university
4. Enter guest mode for that university
5. View posts (read-only)
```

### Guest Interaction Attempts:
```
1. Guest taps like/comment/post
2. Modal appears: "Account Required"
3. Options: [Login] [Sign Up] [Cancel]
4. If Login/Sign Up → navigate to auth
5. After auth → return to full app
```

### Guest to Authenticated:
```
1. Guest clicks "Log In" or "Sign Up"
2. Complete authentication
3. exitGuestMode() called
4. Full app access enabled
5. University preference can be retained
```

---

## 📊 Benefits of Guest Mode

### User Experience:
✅ Preview content before signing up  
✅ See if university is active  
✅ Understand app value proposition  
✅ Lower barrier to entry  

### Apple Compliance:
✅ Shows "non-account-based features" (viewing posts)  
✅ Demonstrates app value without requiring login  
✅ May strengthen App Store submission

### Business:
✅ Higher conversion (users see content first)  
✅ Better onboarding experience  
✅ Showcases community activity  

---

## ⚠️ Privacy Considerations

### Guest Mode Privacy Rules:

1. **No Personal Data Collection**: Guests don't provide any personal info
2. **No Tracking**: Don't track guest behavior across sessions
3. **No Account Creation**: Guest is truly anonymous
4. **Clear Labeling**: Always show "Guest" indicator
5. **Limited Data**: Only show public, non-sensitive content

### Data Shown to Guests:
- ✅ Post titles and descriptions
- ✅ Post types and categories
- ✅ Like/comment counts (numbers only)
- ✅ Poster names as "Anonymous Student" or just "Student"
- ❌ No personal messages
- ❌ No email addresses
- ❌ No full user profiles

---

## 🧪 Testing Checklist

### Backend:
- [ ] Guest can fetch universities list
- [ ] Guest can fetch posts with universityId parameter
- [ ] Authenticated users still work normally
- [ ] No sensitive data exposed to guests

### Web App:
- [ ] University select modal displays and works
- [ ] Guest can view feed with university filter
- [ ] Guest banner displays correctly
- [ ] Restriction modal triggers on interactions
- [ ] Login/signup redirects work from guest mode
- [ ] Guest state persists across page refreshes

### iOS App:
- [ ] University select view displays
- [ ] Guest can browse feed
- [ ] Guest profile view shows correctly
- [ ] Alert triggers on restricted actions
- [ ] Guest to authenticated transition smooth
- [ ] Guest state persists across app restarts

---

## 📝 Apple Review Notes

**For App Review Team:**

> CampusKinect now includes a Guest Mode that allows users to browse university posts without creating an account. This demonstrates the value of the platform while respecting user choice. Users can view content from any university, see post types and categories, and understand the community before deciding to join. Account creation is only required for interactive features (posting, messaging, commenting) which align with the app's core social networking functionality.

---

## 🎉 Summary

### What's Done:
✅ Backend fully supports guest mode  
✅ Guest routes for university selection  
✅ Posts endpoint accepts guest university parameter  
✅ Web auth store has guest state  
✅ University select modal component created  

### What's Next:
⏳ Web guest profile page  
⏳ Web restriction modal  
⏳ iOS guest implementation  
⏳ Guest feed views  
⏳ Testing and refinement  

**Estimated Time to Complete**: 4-6 hours of focused development

---

**Document Version**: 1.0  
**Last Updated**: October 7, 2024  
**Status**: Foundation Complete, Implementation In Progress
