# Admin User Management Feature Guide

## Overview
This feature allows the admin to view all users across all universities on the platform and access detailed user profiles, including all posts they have made.

## Features Implemented

### Backend API Endpoints

1. **GET /api/v1/admin/universities/all**
   - Returns all universities with user counts
   - Includes: id, name, domain, location, userCount
   - Admin authentication required

2. **GET /api/v1/admin/universities/:universityId/users**
   - Returns all users in a specific university
   - Supports pagination (page, limit query params)
   - Includes user stats (post count, message count)
   - Admin authentication required

3. **GET /api/v1/admin/users/:userId/profile**
   - Returns detailed user profile with all posts
   - Includes:
     - Complete user information
     - User statistics (active posts, total posts, messages sent, reports received/made)
     - All posts with images, status, and conversation counts
   - Admin authentication required

### Frontend Pages

1. **Admin Dashboard Enhancement** (`/admin`)
   - Added "User Management" card in the Users tab
   - Button to navigate to the new user management interface

2. **User Management Page** (`/admin/users`)
   - Lists all universities with user counts
   - Click on a university to view all its users
   - Search functionality for both universities and users
   - Displays user cards with:
     - Profile picture
     - Username and display name
     - Email
     - Major, year (if available)
     - Post and message counts
     - Ban status (if applicable)
     - "View Profile" button
   - Pagination support for large user lists

3. **User Profile View** (`/admin/users/profile/[userId]`)
   - Comprehensive user profile display
   - User statistics dashboard
   - Complete list of all user's posts with:
     - Post images
     - Title and description
     - Category, price, location
     - Active/inactive and flagged status
     - Conversation count
     - Post creation date
   - Admin actions:
     - Ban user (if not already banned)
     - Delete individual posts

### API Service Updates

Added three new methods to `apiService`:

```typescript
// Get all universities with detailed info
adminGetAllUniversities(): Promise<University[]>

// Get all users in a university
adminGetUniversityUsers(universityId: number, page?: number, limit?: number): Promise<PaginatedResponse<User>>

// Get user profile with all posts
adminGetUserProfile(userId: string): Promise<UserProfile>
```

## How to Use

### Accessing User Management

1. Navigate to the Admin Dashboard at `/admin`
2. Click on the "Users" tab
3. Click the "View All Users by University" button
4. This takes you to `/admin/users`

### Viewing Users by University

1. On the `/admin/users` page, you'll see a list of all universities
2. Each university card shows:
   - University name
   - Location
   - Total user count
3. Use the search bar to filter universities by name or location
4. Click on any university card to view its users

### Viewing Individual User Profiles

1. After selecting a university, you'll see all users in that university
2. Each user card displays:
   - Profile picture
   - Name and username
   - Email
   - Major and year
   - Post/message counts
   - Ban status
3. Use the search bar to filter users by name, username, or email
4. Click "View Profile" on any user card
5. This takes you to `/admin/users/profile/[userId]`

### User Profile Page

The user profile page shows:

**User Information:**
- Profile picture
- Display name and username
- Email, major, year, hometown
- Bio
- Verification status
- Ban status (if applicable)
- Member since date

**Statistics:**
- Active posts count
- Total posts count
- Messages sent count
- Reports received count
- Reports made count

**All Posts:**
- Scrollable list of all user's posts
- Each post shows:
  - Post image (if available)
  - Title and description
  - Category, price, location
  - Active/inactive status
  - Flagged status (if applicable)
  - Conversation count
  - Creation date
- Admin can delete any post

**Admin Actions:**
- Ban user (prompts for reason)
- Delete individual posts

### Navigation

- **Back buttons** are provided at each level:
  - From user profile → back to university users list
  - From university users list → back to all universities
  - From all universities → back to admin dashboard

## Security

- All endpoints require admin authentication
- Only users with email `lmckeown@calpoly.edu` or username `liam_mckeown38` can access these features
- Unauthorized access attempts return 404 to hide the existence of admin endpoints

## Testing

To test the feature:

1. **Login as admin** (lmckeown@calpoly.edu)
2. **Navigate to Admin Dashboard** → Users tab
3. **Click "View All Users by University"**
4. **Verify:**
   - All universities are listed
   - User counts are correct
   - Search functionality works
5. **Select a university**
6. **Verify:**
   - All users from that university are displayed
   - User information is accurate
   - Search works for users
7. **Click "View Profile" on a user**
8. **Verify:**
   - User profile information is complete
   - All statistics are displayed
   - All user's posts are listed
   - Post details are accurate (images, status, etc.)
9. **Test admin actions:**
   - Try banning a user (use a test account)
   - Try deleting a post (use a test post)

## Database Queries

The backend performs efficient queries:
- Universities are fetched with LEFT JOIN to count active users
- User lists include aggregated post and message counts
- User profile query fetches all posts with images in a single query using ARRAY_AGG
- Statistics are calculated with subqueries for efficiency

## Performance Considerations

- Pagination is implemented for user lists (50 users per page default)
- Images are lazy-loaded in the post listings
- Search filtering happens client-side for immediate feedback
- Database queries use proper indexes on university_id, user_id, and post_id

## Future Enhancements

Potential improvements:
- Add filtering options (by verification status, ban status, etc.)
- Add sorting options (by post count, join date, etc.)
- Export user data to CSV
- Bulk user operations
- View user's message history
- View user's report history (both made and received)

