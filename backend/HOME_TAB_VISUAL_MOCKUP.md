# 🏠 CampusConnect Home Tab Visual Mockup

## 📋 **Overview**
This document provides visual mockups for the CampusConnect Home tab, showcasing the personalized feed, search functionality, filtering system, and post discovery interface.

## 🎨 **Design System**

### **Color Palette**
- **Primary Blue**: #007AFF (buttons, links, focus states)
- **Background**: #F2F2F7 (main feed background)
- **Card Background**: #FFFFFF (post card backgrounds)
- **Text Primary**: #000000 (main text)
- **Text Secondary**: #8E8E93 (secondary text)
- **Border**: #E5E5EA (card borders)
- **Success Green**: #34C759 (offer badges)
- **Warning Orange**: #FF9500 (request badges)
- **Info Blue**: #007AFF (event badges)

### **Typography**
- **Primary Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Heading Sizes**: 20px (post titles), 16px (user names), 14px (body text)
- **Body Text**: 14px (default), 12px (small text)
- **Button Text**: 14px (semibold)

## 🖥️ **Desktop Layout**

### **Home Tab - Main Feed View**
```
┌─────────────────────────────────────────────────────────────────┐
│                        🏠 HOME                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  🔍 [Search posts, events, services...]                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  [All Posts] [Offers] [Requests] [Events]                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Filters ▶                                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  👤 [Profile Pic]  Sarah Johnson                           │ │
│  │     Stanford University • 2 hours ago                      │ │
│  │     [Offer]                                                │ │
│  │                                                             │ │
│  │  📚 Calculus Tutoring Available                            │ │
│  │                                                             │ │
│  │  I'm offering one-on-one calculus tutoring for Math 51.   │ │
│  │  Available evenings and weekends. $25/hour.               │ │
│  │                                                             │ │
│  │  [📚 Academic] [💰 Paid] [📅 Flexible]                    │ │
│  │                                                             │ │
│  │  ⏰ Expires in 5 days                                      │ │
│  │                                                             │ │
│  │  [💬 Contact] [🔖 Save] [📤 Share]                        │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  👤 [Profile Pic]  Mike Chen                               │ │
│  │     UC Berkeley • 4 hours ago                              │ │
│  │     [Request]                                               │ │
│  │                                                             │ │
│  │  🏠 Looking for Sublease - 2BR Apartment                   │ │
│  │                                                             │ │
│  │  Need a 2-bedroom apartment for the fall semester.         │ │
│  │  Budget up to $2000/month. Prefer walking distance to      │ │
│  │  campus. Available August 1st.                             │ │
│  │                                                             │ │
│  │  [🏠 Housing] [💰 Budget] [📅 Fall Semester]              │ │
│  │                                                             │ │
│  │  ⏰ Expires in 2 weeks                                     │ │
│  │                                                             │ │
│  │  [💬 Contact] [🔖 Save] [📤 Share]                        │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  👤 [Profile Pic]  Emma Rodriguez                          │ │
│  │     UCLA • 6 hours ago                                     │ │
│  │     [Event]                                                 │ │
│  │                                                             │ │
│  │  🎉 Study Group Meetup - Computer Science                  │ │
│  │                                                             │ │
│  │  Weekly study group for CS students. All levels welcome!   │ │
│  │  We'll be covering algorithms and data structures.         │ │
│  │  Bring your questions and snacks.                          │ │
│  │                                                             │ │
│  │  📅 Every Tuesday at 7:00 PM                               │ │
│  │  📍 Engineering Library, Room 204                          │ │
│  │                                                             │ │
│  │  [📚 Academic] [🎓 Study Group] [📅 Weekly]               │ │
│  │                                                             │ │
│  │  [💬 Contact] [🔖 Save] [📤 Share]                        │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  👤 [Profile Pic]  Alex Thompson                           │ │
│  │     USC • 8 hours ago                                      │ │
│  │     [Offer]                                                 │ │
│  │                                                             │ │
│  │  🚗 Ride Share to LAX - This Weekend                       │ │
│  │                                                             │ │
│  │  Driving to LAX this Saturday morning. Have 3 seats       │ │
│  │  available. Departing campus at 6:00 AM. $15 per person.  │ │
│  │  Will pick up from main campus area.                       │ │
│  │                                                             │ │
│  │  [🚗 Transportation] [💰 Paid] [📅 One-time]              │ │
│  │                                                             │ │
│  │  ⏰ Expires in 3 days                                      │ │
│  │                                                             │ │
│  │  [💬 Contact] [🔖 Save] [📤 Share]                        │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Loading more posts...]                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Home Tab - With Filters Expanded**
```
┌─────────────────────────────────────────────────────────────────┐
│                        🏠 HOME                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  🔍 [Search posts, events, services...]                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  [All Posts] [Offers] [Requests] [Events]                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Filters ▼                                                │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Tags                                                   │ │
│  │  │  [📚 Academic] [💰 Paid] [📅 Flexible] [+ Add Tags]    │ │
│  │  │                                                         │ │
│  │  │  University                                             │ │
│  │  │  [All Universities ▼]                                  │ │
│  │  │                                                         │ │
│  │  │  Distance                                               │ │
│  │  │  [████████████████████████████████████████████████████] │ │
│  │  │  50 miles                                              │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  👤 [Profile Pic]  Sarah Johnson                           │ │
│  │     Stanford University • 2 hours ago                      │ │
│  │     [Offer]                                                │ │
│  │                                                             │ │
│  │  📚 Calculus Tutoring Available                            │ │
│  │                                                             │ │
│  │  I'm offering one-on-one calculus tutoring for Math 51.   │ │
│  │  Available evenings and weekends. $25/hour.               │ │
│  │                                                             │ │
│  │  [📚 Academic] [💰 Paid] [📅 Flexible]                    │ │
│  │                                                             │ │
│  │  ⏰ Expires in 5 days                                      │ │
│  │                                                             │ │
│  │  [💬 Contact] [🔖 Save] [📤 Share]                        │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Filtered: 3 posts found]                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Home Tab - Search Results**
```
┌─────────────────────────────────────────────────────────────────┐
│                        🏠 HOME                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  🔍 [tutoring]                                            │
│  │  ✕                                                         │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  [All Posts] [Offers] [Requests] [Events]                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Filters ▶                                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  👤 [Profile Pic]  Sarah Johnson                           │ │
│  │     Stanford University • 2 hours ago                      │ │
│  │     [Offer]                                                │ │
│  │                                                             │ │
│  │  📚 Calculus Tutoring Available                            │ │
│  │                                                             │ │
│  │  I'm offering one-on-one calculus tutoring for Math 51.   │ │
│  │  Available evenings and weekends. $25/hour.               │ │
│  │                                                             │ │
│  │  [📚 Academic] [💰 Paid] [📅 Flexible]                    │ │
│  │                                                             │ │
│  │  ⏰ Expires in 5 days                                      │ │
│  │                                                             │ │
│  │  [💬 Contact] [🔖 Save] [📤 Share]                        │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  👤 [Profile Pic]  David Kim                               │ │
│  │     UC Berkeley • 1 day ago                                │ │
│  │     [Offer]                                                 │ │
│  │                                                             │ │
│  │  📚 Physics Study Group - Weekly Sessions                  │ │
│  │                                                             │ │
│  │  Leading a weekly physics study group for Physics 7A.      │ │
│  │  We cover problem-solving strategies and exam prep.        │ │
│  │  Free for all students.                                    │ │
│  │                                                             │ │
│  │  📅 Every Thursday at 6:00 PM                              │ │
│  │  📍 Physics Building, Room 101                             │ │
│  │                                                             │ │
│  │  [📚 Academic] [🎓 Study Group] [📅 Weekly]               │ │
│  │                                                             │ │
│  │  [💬 Contact] [🔖 Save] [📤 Share]                        │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Search results: 2 posts found for "tutoring"]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 **Mobile Layouts**

### **Mobile Home Tab - Main Feed**
```
┌─────────────────────────────────────┐
│           🏠 HOME                  │
├─────────────────────────────────────┤
│                                     │
│  🔍 [Search posts, events...]      │
│                                     │
│  [All] [Offers] [Requests] [Events]│
│                                     │
│  Filters ▶                          │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │  👤 [Profile] Sarah Johnson     │ │
│  │     Stanford • 2h ago           │ │
│  │     [Offer]                     │ │
│  │                                 │ │
│  │  📚 Calculus Tutoring           │ │
│  │                                 │ │
│  │  I'm offering one-on-one        │ │
│  │  calculus tutoring for Math 51. │ │
│  │  Available evenings and         │ │
│  │  weekends. $25/hour.            │ │
│  │                                 │ │
│  │  [📚 Academic] [💰 Paid]        │ │
│  │                                 │ │
│  │  ⏰ Expires in 5 days           │ │
│  │                                 │ │
│  │  [💬 Contact] [🔖 Save]         │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │  👤 [Profile] Mike Chen         │ │
│  │     UC Berkeley • 4h ago        │ │
│  │     [Request]                   │ │
│  │                                 │ │
│  │  🏠 Looking for Sublease        │ │
│  │                                 │ │
│  │  Need a 2-bedroom apartment     │ │
│  │  for the fall semester. Budget  │ │
│  │  up to $2000/month.             │ │
│  │                                 │ │
│  │  [🏠 Housing] [💰 Budget]       │ │
│  │                                 │ │
│  │  ⏰ Expires in 2 weeks          │ │
│  │                                 │ │
│  │  [💬 Contact] [🔖 Save]         │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [Loading more...]                  │
│                                     │
└─────────────────────────────────────┘
```

### **Mobile Home Tab - Filters Expanded**
```
┌─────────────────────────────────────┐
│           🏠 HOME                  │
├─────────────────────────────────────┤
│                                     │
│  🔍 [Search posts, events...]      │
│                                     │
│  [All] [Offers] [Requests] [Events]│
│                                     │
│  Filters ▼                          │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │  Tags                           │ │
│  │  [📚 Academic] [💰 Paid]        │ │
│  │  [+ Add Tags]                   │ │
│  │                                 │ │
│  │  University                     │ │
│  │  [All Universities ▼]           │ │
│  │                                 │ │
│  │  Distance                       │ │
│  │  [████████████████████████████] │ │
│  │  50 miles                       │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [Filtered: 3 posts found]          │
│                                     │
└─────────────────────────────────────┘
```

### **Mobile Home Tab - Search Results**
```
┌─────────────────────────────────────┐
│           🏠 HOME                  │
├─────────────────────────────────────┤
│                                     │
│  🔍 [tutoring] ✕                  │
│                                     │
│  [All] [Offers] [Requests] [Events]│
│                                     │
│  Filters ▶                          │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │  👤 [Profile] Sarah Johnson     │ │
│  │     Stanford • 2h ago           │ │
│  │     [Offer]                     │ │
│  │                                 │ │
│  │  📚 Calculus Tutoring           │ │
│  │                                 │ │
│  │  I'm offering one-on-one        │ │
│  │  calculus tutoring for Math 51. │ │
│  │  Available evenings and         │ │
│  │  weekends. $25/hour.            │ │
│  │                                 │ │
│  │  [📚 Academic] [💰 Paid]        │ │
│  │                                 │ │
│  │  ⏰ Expires in 5 days           │ │
│  │                                 │ │
│  │  [💬 Contact] [🔖 Save]         │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [Search: 2 posts for "tutoring"]   │
│                                     │
└─────────────────────────────────────┘
```

## 🎨 **Interactive Elements**

### **Button States**
- **Primary Button**: Blue background (#007AFF)
- **Hover State**: Darker blue (#0056CC)
- **Disabled State**: Gray background (#C7C7CC)
- **Loading State**: Blue with spinner animation

### **Input States**
- **Default**: Light gray border (#E5E5EA)
- **Focus**: Blue border (#007AFF)
- **Error**: Red border (#FF3B30)
- **Success**: Green border (#34C759)

### **Filter States**
- **Inactive Tab**: Gray border with secondary text
- **Active Tab**: Blue background with white text
- **Hover Tab**: Blue border with blue text

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

## 🔍 **Search & Filtering**

### **Search Functionality**
- **Real-time search** - Instant results as user types
- **Search suggestions** - Popular search terms
- **Search history** - Recent searches
- **Clear search** - Easy reset functionality

### **Filter System**
- **Post type filters** - All, Offers, Requests, Events
- **Tag filters** - Academic, Housing, Transportation, etc.
- **University filters** - Current, nearby, or all universities
- **Distance filters** - Geographic radius selection

## 📊 **Post Display**

### **Post Information**
- **User profile** - Picture, name, university
- **Post metadata** - Type, creation time, expiration
- **Content preview** - Title, description, truncated text
- **Tags and categories** - Relevant post classifications
- **Action buttons** - Contact, save, share

### **Post Types**
- **Offers** - Green badge, services or items available
- **Requests** - Orange badge, help or items needed
- **Events** - Blue badge, gatherings or activities

## 🎯 **User Experience Features**

### **Feed Management**
- **Infinite scroll** - Continuous loading of posts
- **Pull to refresh** - Update feed content
- **Loading states** - Clear progress indicators
- **Error handling** - Graceful error display

### **Interaction Options**
- **Contact users** - Direct messaging capability
- **Save posts** - Bookmark interesting content
- **Share posts** - Share with other users
- **View profiles** - Navigate to user profiles

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

This visual mockup provides a complete design reference for implementing the CampusConnect Home tab with a clean, intuitive, and student-focused marketplace interface. 