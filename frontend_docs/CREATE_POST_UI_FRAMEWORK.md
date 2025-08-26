# 🎨 Create Post UI Framework

## 📋 Overview

The Create Post UI Framework provides comprehensive design specifications for building a modern, intuitive post creation interface. This framework is designed to deliver a seamless user experience that balances functionality with usability, specifically tailored for university communities.

## 🏗️ System Architecture

### **Technology Stack**
- **Frontend**: React.js with TypeScript
- **Styling**: CSS-in-JS or Tailwind CSS
- **State Management**: React Context or Redux
- **Form Handling**: React Hook Form with validation
- **Date Picker**: React DatePicker or similar
- **Image Upload**: Drag & Drop with preview
- **Responsive**: Mobile-first design approach

### **Component Structure**
```
CreatePost/
├── CreatePostContainer.tsx          # Main container
├── PostTypeSelector.tsx             # Post type tabs
├── ContentEditor.tsx                # Text input area
├── ImageUploader.tsx                # Image upload interface
├── DurationSelector.tsx             # Post duration controls
├── TagSelector.tsx                  # Tag selection system
├── ActionButtons.tsx                # Save/Post buttons
├── DurationCalendar.tsx             # Calendar popup
├── TagPopup.tsx                     # Tag selection popup
└── ValidationFeedback.tsx           # Real-time validation
```

## 🎨 Design System

### **Color Palette**
```css
/* Primary Colors */
--primary-blue: #2563eb;        /* Main brand color */
--primary-dark: #1e40af;        /* Hover states */
--primary-light: #dbeafe;       /* Background accents */

/* Secondary Colors */
--secondary-gray: #6b7280;      /* Secondary text */
--secondary-light: #f3f4f6;     /* Light backgrounds */

/* Status Colors */
--success: #10b981;             /* Success states */
--warning: #f59e0b;             /* Warning states */
--error: #ef4444;               /* Error states */

/* Neutral Colors */
--white: #ffffff;               /* Pure white */
--black: #111827;               /* Pure black */
--gray-50: #f9fafb;            /* Lightest gray */
--gray-900: #111827;           /* Darkest gray */
```

### **Typography**
```css
/* Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;            /* 12px - Captions */
--text-sm: 0.875rem;           /* 14px - Small text */
--text-base: 1rem;             /* 16px - Body text */
--text-lg: 1.125rem;           /* 18px - Large text */
--text-xl: 1.25rem;            /* 20px - Headings */
--text-2xl: 1.5rem;            /* 24px - Section titles */
--text-3xl: 1.875rem;          /* 30px - Page titles */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### **Spacing System**
```css
/* Spacing Scale */
--space-1: 0.25rem;            /* 4px */
--space-2: 0.5rem;             /* 8px */
--space-3: 0.75rem;            /* 12px */
--space-4: 1rem;               /* 16px */
--space-5: 1.25rem;            /* 20px */
--space-6: 1.5rem;             /* 24px */
--space-8: 2rem;               /* 32px */
--space-10: 2.5rem;            /* 40px */
--space-12: 3rem;              /* 48px */
--space-16: 4rem;              /* 64px */
--space-20: 5rem;              /* 80px */
```

### **Border Radius**
```css
--radius-sm: 0.25rem;          /* 4px - Small elements */
--radius-md: 0.375rem;         /* 6px - Default */
--radius-lg: 0.5rem;           /* 8px - Large elements */
--radius-xl: 0.75rem;          /* 12px - Cards */
--radius-2xl: 1rem;            /* 16px - Modals */
--radius-full: 9999px;         /* Full - Pills */
```

### **Shadows**
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

## 🎯 Component Specifications

### **1. CreatePostContainer**

**Purpose**: Main container that orchestrates all create post components

**Props**:
```typescript
interface CreatePostContainerProps {
  onPostCreated: (post: Post) => void;
  onDraftSaved: (draft: Draft) => void;
  onCancel: () => void;
  initialData?: Partial<CreatePostData>;
}
```

**Styling**:
```css
.create-post-container {
  max-width: 768px;
  margin: 0 auto;
  padding: var(--space-6);
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}
```

### **2. PostTypeSelector**

**Purpose**: Tab-based selector for Goods/Services vs Events

**Props**:
```typescript
interface PostTypeSelectorProps {
  selectedType: 'goods-services' | 'events';
  onTypeChange: (type: 'goods-services' | 'events') => void;
}
```

**Styling**:
```css
.post-type-selector {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.post-type-tab {
  flex: 1;
  padding: var(--space-4) var(--space-6);
  border: 2px solid var(--secondary-light);
  border-radius: var(--radius-lg);
  background: var(--white);
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-type-tab.active {
  border-color: var(--primary-blue);
  background: var(--primary-light);
  color: var(--primary-dark);
}
```

### **3. ContentEditor**

**Purpose**: Main text input area for post content

**Props**:
```typescript
interface ContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  maxLength: number;
  minLength: number;
}
```

**Styling**:
```css
.content-editor {
  width: 100%;
  min-height: 120px;
  padding: var(--space-4);
  border: 2px solid var(--secondary-light);
  border-radius: var(--radius-lg);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.content-editor:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.character-counter {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--secondary-gray);
}
```

### **4. ImageUploader**

**Purpose**: Drag & drop image upload with preview

**Props**:
```typescript
interface ImageUploaderProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages: number;
  maxFileSize: number;
  acceptedFormats: string[];
}
```

**Styling**:
```css
.image-uploader {
  border: 2px dashed var(--secondary-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  transition: all 0.2s ease;
}

.image-uploader.drag-over {
  border-color: var(--primary-blue);
  background: var(--primary-light);
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.image-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
```

### **5. DurationSelector**

**Purpose**: Post duration selection with quick presets

**Props**:
```typescript
interface DurationSelectorProps {
  duration: PostDuration;
  onDurationChange: (duration: PostDuration) => void;
  quickPresets: QuickPreset[];
}
```

**Styling**:
```css
.duration-selector {
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.duration-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.duration-checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-blue);
}

.quick-presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.quick-preset-button {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--secondary-light);
  border-radius: var(--radius-full);
  background: var(--white);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-preset-button:hover {
  border-color: var(--primary-blue);
  background: var(--primary-light);
}
```

### **6. TagSelector**

**Purpose**: Tag selection system with popup interface

**Props**:
```typescript
interface TagSelectorProps {
  postType: 'goods-services' | 'events';
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  availableTags: AvailableTags;
}
```

**Styling**:
```css
.tag-selector {
  margin-top: var(--space-6);
}

.primary-tags {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.primary-tag {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--secondary-light);
  border-radius: var(--radius-lg);
  background: var(--white);
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-tag.selected {
  border-color: var(--primary-blue);
  background: var(--primary-blue);
  color: var(--white);
}

.tags-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--secondary-light);
  border-radius: var(--radius-lg);
  background: var(--white);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tags-tab:hover {
  border-color: var(--primary-blue);
  background: var(--primary-light);
}
```

### **7. DurationCalendar**

**Purpose**: Calendar popup for custom date selection

**Props**:
```typescript
interface DurationCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  quickPresets: QuickPreset[];
}
```

**Styling**:
```css
.duration-calendar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.duration-calendar-modal {
  background: var(--white);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.calendar-widget {
  border: 1px solid var(--secondary-light);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin: var(--space-4) 0;
}
```

### **8. TagPopup**

**Purpose**: Popup for selecting additional tag categories

**Props**:
```typescript
interface TagPopupProps {
  isOpen: boolean;
  onClose: () => void;
  postType: 'goods-services' | 'events';
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  availableTags: AvailableTags;
}
```

**Styling**:
```css
.tag-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tag-popup-modal {
  background: var(--white);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
}

.tag-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin: var(--space-4) 0;
}

.tag-category {
  border: 1px solid var(--secondary-light);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-category:hover {
  border-color: var(--primary-blue);
  background: var(--primary-light);
}

.tag-category.selected {
  border-color: var(--primary-blue);
  background: var(--primary-blue);
  color: var(--white);
}
```

### **9. ActionButtons**

**Purpose**: Save draft and create post buttons

**Props**:
```typescript
interface ActionButtonsProps {
  isValid: boolean;
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onCreatePost: () => void;
  onCancel: () => void;
}
```

**Styling**:
```css
.action-buttons {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--secondary-light);
}

.action-button {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-button.secondary {
  background: var(--white);
  color: var(--secondary-gray);
  border: 1px solid var(--secondary-light);
}

.action-button.secondary:hover {
  background: var(--gray-50);
  border-color: var(--secondary-gray);
}

.action-button.primary {
  background: var(--primary-blue);
  color: var(--white);
}

.action-button.primary:hover {
  background: var(--primary-dark);
}

.action-button.primary:disabled {
  background: var(--secondary-light);
  color: var(--secondary-gray);
  cursor: not-allowed;
}
```

### **10. ValidationFeedback**

**Purpose**: Real-time validation feedback and suggestions

**Props**:
```typescript
interface ValidationFeedbackProps {
  validation: ValidationResult;
  suggestions: Suggestion[];
  warnings: Warning[];
}
```

**Styling**:
```css
.validation-feedback {
  margin-top: var(--space-4);
}

.validation-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--error);
  font-size: var(--text-sm);
  margin-bottom: var(--space-2);
}

.validation-warning {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--warning);
  font-size: var(--text-sm);
  margin-bottom: var(--space-2);
}

.validation-suggestion {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--success);
  font-size: var(--text-sm);
  margin-bottom: var(--space-2);
}
```

## 📱 Responsive Design

### **Breakpoints**
```css
/* Mobile First Approach */
--breakpoint-sm: 640px;         /* Small tablets */
--breakpoint-md: 768px;         /* Tablets */
--breakpoint-lg: 1024px;        /* Laptops */
--breakpoint-xl: 1280px;        /* Desktops */
--breakpoint-2xl: 1536px;       /* Large screens */
```

### **Mobile Optimizations**
- **Touch-friendly targets** (minimum 44px)
- **Simplified layouts** for small screens
- **Optimized popup positioning**
- **Reduced spacing** on mobile devices
- **Full-width components** on small screens

### **Desktop Enhancements**
- **Multi-column layouts** for larger screens
- **Hover effects** and interactions
- **Keyboard navigation** support
- **Advanced animations** and transitions

## 🎭 Animation & Transitions

### **Duration Standards**
```css
--transition-fast: 150ms;       /* Quick interactions */
--transition-normal: 250ms;     /* Standard transitions */
--transition-slow: 350ms;       /* Complex animations */
```

### **Easing Functions**
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### **Animation Examples**
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn var(--transition-normal) var(--ease-out);
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.slide-up {
  animation: slideUp var(--transition-normal) var(--ease-out);
}
```

## ♿ Accessibility

### **ARIA Labels**
- **Proper form labels** for all inputs
- **Screen reader support** for dynamic content
- **Keyboard navigation** for all interactive elements
- **Focus management** for popups and modals

### **Color Contrast**
- **WCAG AA compliance** for all text
- **High contrast mode** support
- **Color-independent** status indicators
- **Accessible focus indicators**

### **Keyboard Support**
- **Tab navigation** through all elements
- **Enter/Space** for button activation
- **Escape key** for closing modals
- **Arrow keys** for calendar navigation

## 🧪 Testing Guidelines

### **Component Testing**
- **Unit tests** for all components
- **Integration tests** for form flows
- **Accessibility tests** with axe-core
- **Cross-browser testing** for major browsers

### **User Testing**
- **Usability testing** with target users
- **A/B testing** for interface variations
- **Performance testing** for large datasets
- **Mobile device testing** on various screen sizes

## 🚀 Performance Considerations

### **Optimization Strategies**
- **Lazy loading** for non-critical components
- **Memoization** for expensive calculations
- **Debounced inputs** for real-time validation
- **Virtual scrolling** for long lists

### **Bundle Optimization**
- **Code splitting** by route/feature
- **Tree shaking** for unused code
- **Image optimization** and lazy loading
- **Minification** and compression

## 📚 Implementation Checklist

### **Phase 1: Core Components**
- [ ] CreatePostContainer
- [ ] PostTypeSelector
- [ ] ContentEditor
- [ ] Basic styling and layout

### **Phase 2: Advanced Features**
- [ ] ImageUploader
- [ ] DurationSelector
- [ ] TagSelector
- [ ] Form validation

### **Phase 3: Popups & Modals**
- [ ] DurationCalendar
- [ ] TagPopup
- [ ] Modal management
- [ ] Focus handling

### **Phase 4: Polish & Testing**
- [ ] Responsive design
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] User testing

This UI framework provides a solid foundation for building a professional, accessible, and user-friendly create post interface that meets modern design standards and user expectations. 