# 🔐 CampusConnect Authentication Visual Mockup

## 📋 **Overview**
This document provides visual mockups for the CampusConnect authentication system, including signup, login, university verification, and profile setup screens.

## 🎨 **Design System**

### **Color Palette**
- **Primary Blue**: #007AFF (buttons, links, focus states)
- **Background**: #FFFFFF (main background)
- **Secondary Background**: #F2F2F7 (form backgrounds)
- **Text Primary**: #000000 (main text)
- **Text Secondary**: #8E8E93 (secondary text)
- **Border**: #E5E5EA (input borders)
- **Error Red**: #FF3B30 (error messages)
- **Success Green**: #34C759 (success states)

### **Typography**
- **Primary Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Heading Sizes**: 24px (h1), 18px (h2), 16px (h3)
- **Body Text**: 14px (default), 12px (small)
- **Button Text**: 16px (semibold)

## 🖥️ **Desktop Layouts**

### **1. Login Screen**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🔐 CampusConnect                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  🏫 [Logo]                                             │ │ │
│  │  │                                                         │ │ │
│  │  │  Welcome Back                                          │ │ │
│  │  │  Sign in to your CampusConnect account                 │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Email                                              │ │ │ │
│  │  │  │  [your.email@university.edu                    ]   │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Password                                           │ │ │ │
│  │  │  │  [••••••••••••••••••••••••••••••••••••••••••••••••] │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │              [Sign In]                              │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  Don't have an account? [Sign up]                      │ │ │
│  │  │                                                         │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **2. Signup Screen**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🔐 CampusConnect                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  🏫 [Logo]                                             │ │ │
│  │  │                                                         │ │ │
│  │  │  Join CampusConnect                                    │ │ │
│  │  │  Connect with students at your university              │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────┐ ┌─────────────────────────────┐ │ │ │
│  │  │  │  First Name         │ │  Last Name                  │ │ │ │
│  │  │  │  [John           ]  │ │  [Doe                    ]  │ │ │ │
│  │  │  └─────────────────────┘ └─────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  University Email                                   │ │ │ │
│  │  │  │  [your.email@university.edu                    ]   │ │ │ │
│  │  │  │  Use your university email address                 │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Password                                           │ │ │ │
│  │  │  │  [••••••••••••••••••••••••••••••••••••••••••••••••] │ │ │ │
│  │  │  │  At least 8 characters with numbers and symbols     │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Confirm Password                                   │ │ │ │
│  │  │  │  [••••••••••••••••••••••••••••••••••••••••••••••••] │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ☐ I agree to the Terms of Service and Privacy Policy  │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │              [Create Account]                       │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  Already have an account? [Sign in]                    │ │ │
│  │  │                                                         │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **3. Email Verification Screen**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🔐 CampusConnect                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  🏫 [Logo]                                             │ │ │
│  │  │                                                         │ │ │
│  │  │  Verify Your Email                                     │ │ │
│  │  │  We sent a verification code to                        │ │ │
│  │  │  your.email@university.edu                             │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Verification Code                                  │ │ │ │
│  │  │  │  [    1 2 3 4 5 6    ]                             │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │              [Verify Email]                         │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  │  Didn't receive the code?                              │ │ │
│  │  │  [Resend Code]                                         │ │ │
│  │  │                                                         │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **4. Profile Setup Screen**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🔐 CampusConnect                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  🏫 [Logo]                                             │ │ │
│  │  │                                                         │ │ │
│  │  │  Complete Your Profile                                 │ │ │
│  │  │  Help others get to know you better                    │ │ │
│  │  │                                                         │ │ │
│  │  │                    ┌─────────────────┐                  │ │ │
│  │  │                    │                 │                  │ │ │
│  │  │                    │    📷 Add       │                  │ │ │
│  │  │                    │    Photo        │                  │ │ │
│  │  │                    │                 │                  │ │ │
│  │  │                    └─────────────────┘                  │ │ │
│  │  │                    Profile Picture                      │ │ │
│  │  │                    Optional: Add a profile picture      │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Year in School                                     │ │ │ │
│  │  │  │  [Select your year ▼]                               │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
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
│  │  │  │              [Complete Setup]                       │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                         │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 **Mobile Layouts**

### **1. Mobile Login Screen**
```
┌─────────────────────────────────────┐
│                                     │
│           🔐 CampusConnect          │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │  🏫 [Logo]                     │ │
│  │                                 │ │
│  │  Welcome Back                   │ │
│  │  Sign in to your CampusConnect │ │
│  │  account                        │ │
│  │                                 │ │
│  │  Email                          │ │
│  │  [your.email@university.edu]    │ │
│  │                                 │ │
│  │  Password                       │ │
│  │  [••••••••••••••••••••••••••••] │ │
│  │                                 │ │
│  │  [        Sign In        ]      │ │
│  │                                 │ │
│  │  Don't have an account?        │ │
│  │  [Sign up]                     │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### **2. Mobile Signup Screen**
```
┌─────────────────────────────────────┐
│                                     │
│           🔐 CampusConnect          │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │  🏫 [Logo]                     │ │
│  │                                 │ │
│  │  Join CampusConnect            │ │
│  │  Connect with students at your │ │
│  │  university                     │ │
│  │                                 │ │
│  │  First Name                     │ │
│  │  [John                       ]  │ │
│  │                                 │ │
│  │  Last Name                      │ │
│  │  [Doe                        ]  │ │
│  │                                 │ │
│  │  University Email               │ │
│  │  [your.email@university.edu]    │ │
│  │  Use your university email      │ │
│  │                                 │ │
│  │  Password                       │ │
│  │  [••••••••••••••••••••••••••••] │ │
│  │  At least 8 characters          │ │
│  │                                 │ │
│  │  Confirm Password               │ │
│  │  [••••••••••••••••••••••••••••] │ │
│  │                                 │ │
│  │  ☐ I agree to Terms & Privacy  │ │
│  │                                 │ │
│  │  [      Create Account     ]    │ │
│  │                                 │ │
│  │  Already have an account?       │ │
│  │  [Sign in]                     │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### **3. Mobile Email Verification**
```
┌─────────────────────────────────────┐
│                                     │
│           🔐 CampusConnect          │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │  🏫 [Logo]                     │ │
│  │                                 │ │
│  │  Verify Your Email             │ │
│  │  We sent a verification code   │ │
│  │  to your.email@university.edu  │ │
│  │                                 │ │
│  │  Verification Code              │ │
│  │  [1 2 3 4 5 6]                │ │
│  │                                 │ │
│  │  [      Verify Email      ]     │ │
│  │                                 │ │
│  │  Didn't receive the code?      │ │
│  │  [Resend Code]                 │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### **4. Mobile Profile Setup**
```
┌─────────────────────────────────────┐
│                                     │
│           🔐 CampusConnect          │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │  🏫 [Logo]                     │ │
│  │                                 │ │
│  │  Complete Your Profile         │ │
│  │  Help others get to know you   │ │
│  │                                 │ │
│  │        ┌─────────────┐          │ │
│  │        │             │          │ │
│  │        │  📷 Add     │          │ │
│  │        │  Photo      │          │ │
│  │        │             │          │ │
│  │        └─────────────┘          │ │
│  │        Profile Picture          │ │
│  │        Optional                 │ │
│  │                                 │ │
│  │  Year in School                 │ │
│  │  [Select your year ▼]           │ │
│  │                                 │ │
│  │  Major/Field of Study           │ │
│  │  [Computer Science           ]  │ │
│  │                                 │ │
│  │  Hometown                       │ │
│  │  [San Francisco, CA          ]  │ │
│  │                                 │ │
│  │  [    Complete Setup     ]      │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
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

### **Form Validation**
- **Real-time feedback** - Immediate validation
- **Error messages** - Below input fields
- **Success indicators** - Green checkmarks
- **Loading states** - Disabled inputs

## 📱 **Responsive Features**

### **Mobile Optimizations**
- **Touch-friendly inputs** - Minimum 44px height
- **Large buttons** - Easy thumb navigation
- **Simplified layouts** - Single-column forms
- **Optimized spacing** - Appropriate margins

### **Desktop Enhancements**
- **Multi-column layouts** - Side-by-side fields
- **Hover effects** - Interactive feedback
- **Keyboard shortcuts** - Tab navigation
- **Larger touch targets** - Better desktop experience

## 🔒 **Security Indicators**

### **Visual Security Cues**
- **Lock icon** - Secure connection indicator
- **University branding** - Trust and authenticity
- **Professional design** - Credibility and safety
- **Clear messaging** - Transparent about data usage

### **User Confidence**
- **Step-by-step process** - Clear progression
- **Progress indicators** - Completion status
- **Helpful guidance** - Form assistance
- **Error prevention** - Validation and warnings

## 🎯 **User Experience Flow**

### **1. Initial Landing**
- **Clean, professional design** - Builds trust
- **Clear value proposition** - Student marketplace
- **Simple navigation** - Login or signup choice

### **2. Signup Process**
- **Progressive disclosure** - One step at a time
- **University verification** - Email domain validation
- **Profile completion** - Essential information only

### **3. Login Experience**
- **Quick access** - Minimal friction
- **Password recovery** - Easy account recovery
- **Remember me** - Convenient access

### **4. Verification & Setup**
- **Email verification** - Security confirmation
- **Profile setup** - Personalization options
- **Welcome experience** - Platform introduction

## 📋 **Implementation Notes**

### **Design Consistency**
- **Brand colors** - Consistent throughout
- **Typography** - Unified font hierarchy
- **Spacing** - Consistent margins and padding
- **Components** - Reusable design elements

### **Accessibility**
- **Color contrast** - WCAG AA compliance
- **Screen readers** - Proper labeling
- **Keyboard navigation** - Logical tab order
- **Focus management** - Clear focus indicators

This visual mockup provides a complete design reference for implementing the CampusConnect authentication system with a clean, professional, and student-focused interface. 