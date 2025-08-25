# 👤 CampusConnect Profile Tab Visual Mockup

## 📋 **Overview**
This document provides visual mockups for the CampusConnect Profile tab, showcasing profile management, post history with selection capabilities, and bulk fulfillment functionality.

## 🎨 **Design System**

### **Color Palette**
- **Primary Blue**: #007AFF (buttons, links, focus states)
- **Background**: #F2F2F7 (main background)
- **Card Background**: #FFFFFF (profile and post card backgrounds)
- **Text Primary**: #000000 (main text)
- **Text Secondary**: #8E8E93 (secondary text)
- **Border**: #E5E5EA (card borders)
- **Success Green**: #34C759 (offer badges)
- **Warning Orange**: #FF9500 (request badges)
- **Info Blue**: #007AFF (event badges)
- **Error Red**: #FF3B30 (danger actions)

### **Typography**
- **Primary Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Heading Sizes**: 24px (profile name), 20px (section headers), 16px (post titles)
- **Body Text**: 14px (default), 12px (small text)
- **Button Text**: 14px (semibold)

## 🖥️ **Desktop Layout**

### **Profile Tab - Main View**
```
┌─────────────────────────────────────────────────────────────────┐
│                        👤 PROFILE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │ │
│  │  │  🏫 [Profile Picture]                                  │ │ │
│  │  │                                                         │ │ │
│  │  │  John Doe                                               │ │ │
│  │  │  Computer Science                                       │ │ │
│  │  │  Year 3                                                 │ │ │
│  │  │  San Francisco, CA                                      │ │ │
│  │  │                                                         │ │ │
│  │  │  🏫 Stanford University                                 │ │ │
│  │  │  📅 Member since September 2023                        │ │ │
│  │  │                                                         │ │ │
│  │  │  [✏️ Edit Profile]                                      │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ✏️ Create Post  •  🔒 Privacy  •  ⚙️ Settings            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  📝 My Posts                                              │ │
│  │                                                             │ │
│  │  [All (8)] [Active (6)] [Expired (2)]                     │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] [Offer] Calculus Tutoring Available               │ │ │
│  │  │      📚 Academic • 💰 Paid • 📅 Flexible               │ │ │
│  │  │      I'm offering one-on-one calculus tutoring for     │ │ │
│  │  │      Math 51. Available evenings and weekends.         │ │ │
│  │  │      $25/hour.                                         │ │ │
│  │  │                                                         │ │ │
│  │  │      ⏰ Expires in 5 days                               │ │ │
│  │  │      Created 2 hours ago                                │ │ │
│  │  │                                                         │ │ │
│  │  │      [Edit] [Delete]                                    │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] [Request] Looking for Sublease - 2BR Apartment    │ │ │
│  │  │      🏠 Housing • 💰 Budget • 📅 Fall Semester         │ │ │
│  │  │      Need a 2-bedroom apartment for the fall semester. │ │ │
│  │  │      Budget up to $2000/month. Prefer walking distance │ │ │
│  │  │      to campus. Available August 1st.                  │ │ │
│  │  │                                                         │ │ │
│  │  │      ⏰ Expires in 2 weeks                              │ │ │
│  │  │      Created 1 day ago                                  │ │ │
│  │  │                                                         │ │ │
│  │  │      [Edit] [Delete]                                    │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  [ ] [Event] Study Group Meetup - Computer Science     │ │ │
│  │  │      📚 Academic • 🎓 Study Group • 📅 Weekly           │ │ │
│  │  │      Weekly study group for CS students. All levels     │ │ │
│  │  │      welcome! We'll be covering algorithms and data     │ │ │
│  │  │      structures. Bring your questions and snacks.       │ │ │
│  │  │                                                         │ │ │
│  │  │      📅 Every Tuesday at 7:00 PM                        │ │ │
│  │  │      📍 Engineering Library, Room 204                   │ │ │
│  │  │                                                         │ │ │
│  │  │      [Edit] [Delete]                                    │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  [Fulfill Selected Posts (2)]                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Profile Tab - Edit Mode**
```
┌─────────────────────────────────────────────────────────────────┐
│                        👤 PROFILE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │ │
│  │  │  🏫 [Profile Picture]                                  │ │ │
│  │  │  📷                                                    │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────┐ ┌─────────────────────────────┐ │ │ │
│  │  │  │  First Name         │ │  Last Name                  │ │ │ │
│  │  │  │  [John           ]  │ │  [Doe                    ]  │ │ │ │
│  │  │  └─────────────────────┘ └─────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Major/Field of Study                               │ │ │ │
│  │  │  │  [Computer Science                               ]  │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Hometown                                           │ │ │ │
│  │  │  │  [San Francisco, CA                              ]  │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Year in School                                     │ │ │ │
│  │  │  │  [Third Year ▼]                                     │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  🏫 Stanford University                                 │ │ │
│  │  │  📅 Member since September 2023                        │ │ │
│  │  │                                                         │ │ │
│  │  │  [Cancel]                    [Save Changes]             │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ✏️ Create Post  •  🔒 Privacy  •  ⚙️ Settings            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  📝 My Posts                                              │ │
│  │                                                             │ │
│  │  [All (8)] [Active (6)] [Expired (2)]                     │ │
│  │                                                             │ │
│  │  [Select All]                                              │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] [Offer] Calculus Tutoring Available               │ │ │
│  │  │      📚 Academic • 💰 Paid • 📅 Flexible               │ │ │
│  │  │      I'm offering one-on-one calculus tutoring for     │ │ │
│  │  │      Math 51. Available evenings and weekends.         │ │ │
│  │  │      $25/hour.                                         │ │ │
│  │  │                                                         │ │ │
│  │  │      ⏰ Expires in 5 days                               │ │ │
│  │  │      Created 2 hours ago                                │ │ │
│  │  │                                                         │ │ │
│  │  │      [Edit] [Delete]                                    │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  [Fulfill Selected Posts (2)]                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Profile Tab - Bulk Fulfillment Modal**
```
┌─────────────────────────────────────────────────────────────────┐
│                        👤 PROFILE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │ │
│  │  │  🏫 [Profile Picture]                                  │ │ │
│  │  │                                                         │ │ │
│  │  │  John Doe                                               │ │ │
│  │  │  Computer Science                                       │ │ │
│  │  │  Year 3                                                 │ │ │
│  │  │  San Francisco, CA                                      │ │ │
│  │  │                                                         │ │ │
│  │  │  🏫 Stanford University                                 │ │ │
│  │  │  📅 Member since September 2023                        │ │ │
│  │  │                                                         │ │ │
│  │  │  [✏️ Edit Profile]                                      │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ✏️ Create Post  •  🔒 Privacy  •  ⚙️ Settings            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  📝 My Posts                                              │ │
│  │                                                             │ │
│  │  [All (8)] [Active (6)] [Expired (2)]                     │ │
│  │                                                             │ │
│  │  [Select All]                                              │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] [Offer] Calculus Tutoring Available               │ │ │
│  │  │      📚 Academic • 💰 Paid • 📅 Flexible               │ │ │
│  │  │      I'm offering one-on-one calculus tutoring for     │ │ │
│  │  │      Math 51. Available evenings and weekends.         │ │ │
│  │  │      $25/hour.                                         │ │ │
│  │  │                                                         │ │ │
│  │  │      ⏰ Expires in 5 days                               │ │ │
│  │  │      Created 2 hours ago                                │ │ │
│  │  │                                                         │ │ │
│  │  │      [Edit] [Delete]                                    │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  [Fulfill Selected Posts (2)]                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    ⚠️  Fulfill Posts                       │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  You are about to fulfill 2 selected posts.                │ │
│  │                                                             │ │
│  │  ⚠️  IMPORTANT: When a post is fulfilled, it is           │ │
│  │     PERMANENTLY DELETED and cannot be recovered.           │ │
│  │                                                             │ │
│  │  This action will:                                          │ │
│  │  • Remove the posts from your profile                      │ │
│  │  • Delete all associated images and tags                   │ │
│  │  • Remove the posts from search results                    │ │
│  │  • Cannot be undone                                         │ │
│  │                                                             │ │
│  │  Are you sure you want to permanently delete these posts?  │ │
│  │                                                             │ │
│  │  [Cancel]                    [Fulfill & Delete (2)]        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 **Mobile Layouts**

### **Mobile Profile Tab - Main View**
```
┌─────────────────────────────────────┐
│           👤 PROFILE               │
├─────────────────────────────────────┤
│                                     │
│  🏫 [Profile Picture]               │
│  📷                                 │
│                                     │
│  John Doe                           │
│  Computer Science                   │
│  Year 3                             │
│  San Francisco, CA                  │
│                                     │
│  🏫 Stanford University             │
│  📅 Member since Sept 2023          │
│                                     │
│  [✏️ Edit Profile]                  │
│                                     │
│  ✏️ Create Post                     │
│  🔒 Privacy                         │
│  ⚙️ Settings                        │
│                                     │
│  📝 My Posts                        │
│                                     │
│  [All (8)] [Active (6)] [Expired]  │
│                                     │
│  [Select All]                       │
│                                     │
│  [✓] [Offer] Calculus Tutoring     │
│  📚 Academic • 💰 Paid              │
│  I'm offering one-on-one calculus  │
│  tutoring for Math 51. Available   │
│  evenings and weekends. $25/hour.   │
│  ⏰ Expires in 5 days               │
│  Created 2 hours ago                │
│  [Edit] [Delete]                    │
│                                     │
│  [✓] [Request] Looking for Sublease│
│  🏠 Housing • 💰 Budget             │
│  Need a 2-bedroom apartment for    │
│  the fall semester. Budget up to   │
│  $2000/month. Prefer walking       │
│  distance to campus.                │
│  ⏰ Expires in 2 weeks              │
│  Created 1 day ago                  │
│  [Edit] [Delete]                    │
│                                     │
│  [Fulfill Selected (2)]             │
│                                     │
└─────────────────────────────────────┘
```

### **Mobile Profile Tab - Edit Mode**
```
┌─────────────────────────────────────┐
│           👤 PROFILE               │
├─────────────────────────────────────┤
│                                     │
│  🏫 [Profile Picture]               │
│  📷                                 │
│                                     │
│  First Name                         │
│  [John                           ]  │
│                                     │
│  Last Name                          │
│  [Doe                            ]  │
│                                     │
│  Major/Field of Study               │
│  [Computer Science               ]  │
│                                     │
│  Hometown                           │
│  [San Francisco, CA              ]  │
│                                     │
│  Year in School                     │
│  [Third Year ▼]                     │
│                                     │
│  🏫 Stanford University             │
│  📅 Member since Sept 2023          │
│                                     │
│  [Cancel]  [Save Changes]           │
│                                     │
│  ✏️ Create Post                     │
│  🔒 Privacy                         │
│  ⚙️ Settings                        │
│                                     │
│  📝 My Posts                        │
│                                     │
│  [All (8)] [Active (6)] [Expired]  │
│                                     │
│  [Select All]                       │
│                                     │
│  [✓] [Offer] Calculus Tutoring     │
│  📚 Academic • 💰 Paid              │
│  I'm offering one-on-one calculus  │
│  tutoring for Math 51. Available   │
│  evenings and weekends. $25/hour.   │
│  ⏰ Expires in 5 days               │
│  Created 2 hours ago                │
│  [Edit] [Delete]                    │
│                                     │
│  [Fulfill Selected (2)]             │
│                                     │
└─────────────────────────────────────┘
```

### **Mobile Profile Tab - Fulfillment Modal**
```
┌─────────────────────────────────────┐
│           👤 PROFILE               │
├─────────────────────────────────────┤
│                                     │
│  🏫 [Profile Picture]               │
│  📷                                 │
│                                     │
│  John Doe                           │
│  Computer Science                   │
│  Year 3                             │
│  San Francisco, CA                  │
│                                     │
│  🏫 Stanford University             │
│  📅 Member since Sept 2023          │
│                                     │
│  [✏️ Edit Profile]                  │
│                                     │
│  ✏️ Create Post                     │
│  🔒 Privacy                         │
│  ⚙️ Settings                        │
│                                     │
│  📝 My Posts                        │
│                                     │
│  [All (8)] [Active (6)] [Expired]  │
│                                     │
│  [Select All]                       │
│                                     │
│  [✓] [Offer] Calculus Tutoring     │
│  📚 Academic • 💰 Paid              │
│  I'm offering one-on-one calculus  │
│  tutoring for Math 51. Available   │
│  evenings and weekends. $25/hour.   │
│  ⏰ Expires in 5 days               │
│  Created 2 hours ago                │
│  [Edit] [Delete]                    │
│                                     │
│  [Fulfill Selected (2)]             │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        ⚠️  Fulfill Posts        │ │
│  ├─────────────────────────────────┤ │
│  │                                 │ │
│  │  You are about to fulfill 2     │ │
│  │  selected posts.                │ │
│  │                                 │ │
│  │  ⚠️  IMPORTANT:                 │ │
│  │  Fulfilled posts are            │ │
│  │  PERMANENTLY DELETED and        │ │
│  │  cannot be recovered.           │ │
│  │                                 │ │
│  │  This will remove posts,        │ │
│  │  images, and tags permanently.  │ │
│  │                                 │ │
│  │  Are you sure?                  │ │
│  │                                 │ │
│  │  [Cancel]  [Fulfill & Delete]   │ │
│  └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

## 🎨 **Interactive Elements**

### **Button States**
- **Primary Button**: Blue background (#007AFF)
- **Secondary Button**: Gray background (#E5E5EA)
- **Danger Button**: Red background (#FF3B30)
- **Hover State**: Darker variants of base colors
- **Disabled State**: Gray background (#C7C7CC)

### **Input States**
- **Default**: Light gray border (#E5E5EA)
- **Focus**: Blue border (#007AFF)
- **Error**: Red border (#FF3B30)
- **Success**: Green border (#34C759)

### **Checkbox States**
- **Unchecked**: Gray border (#E5E5EA)
- **Checked**: Blue background (#007AFF) with white checkmark
- **Hover**: Blue border (#007AFF)

## 📱 **Responsive Features**

### **Mobile Optimizations**
- **Touch-friendly inputs** - Minimum 44px height
- **Large buttons** - Easy thumb navigation
- **Simplified layouts** - Single-column on mobile
- **Optimized spacing** - Appropriate margins for mobile

### **Desktop Enhancements**
- **Multi-column layouts** - Side-by-side elements
- **Hover effects** - Interactive feedback
- **Keyboard navigation** - Tab order and shortcuts
- **Larger touch targets** - Better desktop experience

## 🔍 **Post Management Features**

### **Selection System**
- **Individual checkboxes** - Select specific posts
- **Select all option** - Bulk selection
- **Selection counter** - Shows number of selected posts
- **Bulk actions** - Fulfill multiple posts at once

### **Post Filtering**
- **All posts** - Complete post history
- **Active posts** - Currently active posts
- **Expired posts** - Past expiration date
- **Post count** - Number of posts in each category

### **Post Actions**
- **Edit post** - Modify existing post details
- **Delete post** - Remove individual post
- **Bulk fulfill** - Remove multiple selected posts
- **Post metadata** - Creation date, expiration, tags

## ⚠️ **Safety Features**

### **Fulfillment Confirmation**
- **Clear warning** - "PERMANENTLY DELETED" in bold
- **Consequences list** - What will happen to posts
- **Irreversibility** - Cannot be undone
- **Confirmation required** - Must click "Fulfill & Delete"

### **User Protection**
- **Confirmation dialog** - Prevents accidental deletion
- **Clear language** - No ambiguous terms
- **Visual warnings** - Warning icons and colors
- **Two-step process** - Select then confirm

## 🎯 **User Experience Features**

### **Profile Management**
- **Edit mode toggle** - Switch between view and edit
- **Form validation** - Real-time input validation
- **Cancel option** - Revert changes without saving
- **Save confirmation** - Clear feedback on updates

### **Post Organization**
- **Clear categorization** - Visual post type badges
- **Efficient selection** - Checkbox-based selection
- **Bulk operations** - Handle multiple posts efficiently
- **Filter options** - Organize posts by status

## 📋 **Implementation Notes**

### **Design Consistency**
- **Brand colors** - Consistent throughout interface
- **Typography** - Unified font hierarchy
- **Spacing** - Consistent margins and padding
- **Components** - Reusable design elements

### **Accessibility**
- **Color contrast** - WCAG AA compliance
- **Screen readers** - Proper labeling
- **Keyboard navigation** - Logical tab order
- **Focus management** - Clear focus indicators

This visual mockup provides a complete design reference for implementing the CampusConnect Profile tab with efficient post management and safe bulk fulfillment capabilities. 