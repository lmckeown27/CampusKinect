# 🎓 CampusConnect Web Frontend

A modern, responsive web application for the CampusConnect student community platform. Built with Next.js, React, and TypeScript.

## ✨ Features

### 🏠 **Home Tab**
- **3-Tab System**: Goods/Services, All, Events
- **Side Pullout Panels**: Dynamic filtering for each tab type
- **Smart Tag System**: Offer/Request visible for Goods/Services, hidden for Events
- **Search Functionality**: Real-time post search and filtering
- **Post Cards**: Rich display with images, tags, grades, and interaction buttons

### ✍️ **Create Post Tab**
- **Post Type Selection**: Offer, Request, or Event
- **Duration Options**: One-time, Recurring, or Event with calendar
- **Smart Tag Logic**: Offer/Request tags for Goods/Services, excluded for Events
- **Image Upload**: Multiple image support with preview
- **Form Validation**: Comprehensive client-side validation
- **Quick Presets**: 1-day, 3-day, 1-week, 2-week, 1-month options

### 💬 **Messages Tab**
- **Conversation List**: Instagram-style chat interface
- **Message Requests**: Accept/Reject system for new conversations
- **Search Conversations**: Find existing chats quickly
- **New Message Icon**: Send messages to new users
- **Unread Indicators**: Visual notifications for new messages

### 👤 **Profile Tab**
- **Editable Profile**: Update display name, hometown, year, major
- **Post Management**: View, edit, and fulfill your posts
- **Bookmarks Access**: Quick access to saved posts
- **Post Fulfillment**: Bulk select and mark posts as fulfilled
- **Settings Integration**: Quick access to app settings

## 🛠️ Technology Stack

### **Frontend Framework**
- **Next.js 14**: App Router, Server Components, API Routes
- **React 18**: Hooks, Context, Suspense
- **TypeScript**: Type safety and developer experience

### **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Headless UI**: Accessible UI components
- **Responsive Design**: Mobile-first approach

### **State Management**
- **Zustand**: Lightweight state management
- **React Hook Form**: Performant forms with validation
- **Zod**: Schema validation and type inference

### **Data & API**
- **Axios**: HTTP client for API calls
- **Socket.io Client**: Real-time messaging
- **Local Storage**: Persistent state management

### **Testing**
- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **Testing Library Jest DOM**: Custom matchers

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusConnect_Web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### **Available Scripts**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - TypeScript type checking

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── home/              # Home tab page
│   ├── create-post/       # Create post page
│   ├── messages/          # Messages page
│   └── profile/           # Profile page
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   ├── tabs/              # Main tab components
│   └── ui/                # Reusable UI components
├── stores/                 # Zustand state stores
├── services/               # API and external services
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## 🎨 Component Architecture

### **Layout Components**
- `MainLayout`: Main app wrapper with header and navigation
- `Header`: Top navigation with user profile and settings
- `BottomNavigation`: Mobile-first tab navigation

### **Tab Components**
- `HomeTab`: Main feed with 3-tab system and side panels
- `CreatePostTab`: Comprehensive post creation form
- `MessagesTab`: Conversation management and messaging
- `ProfileTab`: User profile and post management

### **UI Components**
- `PostCard`: Rich post display with interactions
- `TagSelector`: Smart tag selection with search
- `DurationSelector`: Post duration and event scheduling
- `LoginForm`: User authentication
- `RegisterForm`: User registration

### **State Management**
- `authStore`: User authentication and profile state
- `postsStore`: Posts, filtering, and interactions
- `messagesStore`: Conversations and messaging state

## 🔧 Configuration

### **Environment Variables**

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Authentication
NEXT_PUBLIC_JWT_STORAGE_KEY=campusconnect_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=campusconnect_refresh_token

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEBUG_MODE=true

# External Services
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### **Tailwind Configuration**

The project uses Tailwind CSS with custom configuration for:
- Color schemes
- Typography scales
- Spacing systems
- Component variants

## 🧪 Testing

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Test Structure**
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Component interaction testing
- **Mock Data**: Comprehensive test fixtures
- **Accessibility**: Screen reader and keyboard navigation testing

## 📱 Responsive Design

### **Mobile-First Approach**
- **Bottom Navigation**: Optimized for thumb navigation
- **Touch Targets**: Minimum 44px touch areas
- **Gesture Support**: Swipe actions for mobile
- **Responsive Images**: Optimized for different screen sizes

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## ♿ Accessibility

### **WCAG 2.1 AA Compliance**
- **Semantic HTML**: Proper heading structure and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: Minimum 4.5:1 contrast ratio
- **Focus Management**: Visible focus indicators

## 🔒 Security Features

### **Authentication**
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token renewal
- **Educational Email Validation**: .edu domain verification
- **Password Requirements**: Strong password enforcement

### **Data Protection**
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: Content Security Policy
- **CSRF Protection**: Cross-Site Request Forgery prevention

## 🚀 Performance

### **Optimization Strategies**
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Component and image lazy loading
- **Bundle Analysis**: Webpack bundle analyzer

### **Performance Metrics**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🌐 Browser Support

### **Modern Browsers**
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### **Mobile Browsers**
- **iOS Safari**: 14+
- **Chrome Mobile**: 90+
- **Samsung Internet**: 15+

## 📦 Deployment

### **Build Process**
```bash
# Create production build
npm run build

# Start production server
npm start
```

### **Deployment Options**
- **Vercel**: Zero-config deployment
- **Netlify**: Static site deployment
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### **Code Standards**
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

## 📚 Documentation

### **Additional Resources**
- [Component Library](./docs/components.md)
- [API Integration](./docs/api.md)
- [State Management](./docs/state.md)
- [Testing Guide](./docs/testing.md)
- [Deployment Guide](./docs/deployment.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Documentation**: Comprehensive inline documentation
- **Examples**: Working examples in the codebase

### **Community**
- **Discord**: Join our developer community
- **Email**: support@campusconnect.com
- **Twitter**: @CampusConnectDev

---

**Built with ❤️ by the CampusConnect Team**

*Empowering students to connect, collaborate, and thrive on campus.*


## ✨ Features

### 🏠 **Home Tab**
- **3-Tab System**: Goods/Services, All, Events
- **Side Pullout Panels**: Dynamic filtering for each tab type
- **Smart Tag System**: Offer/Request visible for Goods/Services, hidden for Events
- **Search Functionality**: Real-time post search and filtering
- **Post Cards**: Rich display with images, tags, grades, and interaction buttons

### ✍️ **Create Post Tab**
- **Post Type Selection**: Offer, Request, or Event
- **Duration Options**: One-time, Recurring, or Event with calendar
- **Smart Tag Logic**: Offer/Request tags for Goods/Services, excluded for Events
- **Image Upload**: Multiple image support with preview
- **Form Validation**: Comprehensive client-side validation
- **Quick Presets**: 1-day, 3-day, 1-week, 2-week, 1-month options

### 💬 **Messages Tab**
- **Conversation List**: Instagram-style chat interface
- **Message Requests**: Accept/Reject system for new conversations
- **Search Conversations**: Find existing chats quickly
- **New Message Icon**: Send messages to new users
- **Unread Indicators**: Visual notifications for new messages

### 👤 **Profile Tab**
- **Editable Profile**: Update display name, hometown, year, major
- **Post Management**: View, edit, and fulfill your posts
- **Bookmarks Access**: Quick access to saved posts
- **Post Fulfillment**: Bulk select and mark posts as fulfilled
- **Settings Integration**: Quick access to app settings

## 🛠️ Technology Stack

### **Frontend Framework**
- **Next.js 14**: App Router, Server Components, API Routes
- **React 18**: Hooks, Context, Suspense
- **TypeScript**: Type safety and developer experience

### **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Headless UI**: Accessible UI components
- **Responsive Design**: Mobile-first approach

### **State Management**
- **Zustand**: Lightweight state management
- **React Hook Form**: Performant forms with validation
- **Zod**: Schema validation and type inference

### **Data & API**
- **Axios**: HTTP client for API calls
- **Socket.io Client**: Real-time messaging
- **Local Storage**: Persistent state management

### **Testing**
- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **Testing Library Jest DOM**: Custom matchers

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusConnect_Web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### **Available Scripts**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - TypeScript type checking

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── home/              # Home tab page
│   ├── create-post/       # Create post page
│   ├── messages/          # Messages page
│   └── profile/           # Profile page
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   ├── tabs/              # Main tab components
│   └── ui/                # Reusable UI components
├── stores/                 # Zustand state stores
├── services/               # API and external services
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## 🎨 Component Architecture

### **Layout Components**
- `MainLayout`: Main app wrapper with header and navigation
- `Header`: Top navigation with user profile and settings
- `BottomNavigation`: Mobile-first tab navigation

### **Tab Components**
- `HomeTab`: Main feed with 3-tab system and side panels
- `CreatePostTab`: Comprehensive post creation form
- `MessagesTab`: Conversation management and messaging
- `ProfileTab`: User profile and post management

### **UI Components**
- `PostCard`: Rich post display with interactions
- `TagSelector`: Smart tag selection with search
- `DurationSelector`: Post duration and event scheduling
- `LoginForm`: User authentication
- `RegisterForm`: User registration

### **State Management**
- `authStore`: User authentication and profile state
- `postsStore`: Posts, filtering, and interactions
- `messagesStore`: Conversations and messaging state

## 🔧 Configuration

### **Environment Variables**

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Authentication
NEXT_PUBLIC_JWT_STORAGE_KEY=campusconnect_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=campusconnect_refresh_token

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEBUG_MODE=true

# External Services
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### **Tailwind Configuration**

The project uses Tailwind CSS with custom configuration for:
- Color schemes
- Typography scales
- Spacing systems
- Component variants

## 🧪 Testing

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Test Structure**
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Component interaction testing
- **Mock Data**: Comprehensive test fixtures
- **Accessibility**: Screen reader and keyboard navigation testing

## 📱 Responsive Design

### **Mobile-First Approach**
- **Bottom Navigation**: Optimized for thumb navigation
- **Touch Targets**: Minimum 44px touch areas
- **Gesture Support**: Swipe actions for mobile
- **Responsive Images**: Optimized for different screen sizes

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## ♿ Accessibility

### **WCAG 2.1 AA Compliance**
- **Semantic HTML**: Proper heading structure and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: Minimum 4.5:1 contrast ratio
- **Focus Management**: Visible focus indicators

## 🔒 Security Features

### **Authentication**
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token renewal
- **Educational Email Validation**: .edu domain verification
- **Password Requirements**: Strong password enforcement

### **Data Protection**
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: Content Security Policy
- **CSRF Protection**: Cross-Site Request Forgery prevention

## 🚀 Performance

### **Optimization Strategies**
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Component and image lazy loading
- **Bundle Analysis**: Webpack bundle analyzer

### **Performance Metrics**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🌐 Browser Support

### **Modern Browsers**
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### **Mobile Browsers**
- **iOS Safari**: 14+
- **Chrome Mobile**: 90+
- **Samsung Internet**: 15+

## 📦 Deployment

### **Build Process**
```bash
# Create production build
npm run build

# Start production server
npm start
```

### **Deployment Options**
- **Vercel**: Zero-config deployment
- **Netlify**: Static site deployment
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### **Code Standards**
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

## 📚 Documentation

### **Additional Resources**
- [Component Library](./docs/components.md)
- [API Integration](./docs/api.md)
- [State Management](./docs/state.md)
- [Testing Guide](./docs/testing.md)
- [Deployment Guide](./docs/deployment.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Documentation**: Comprehensive inline documentation
- **Examples**: Working examples in the codebase

### **Community**
- **Discord**: Join our developer community
- **Email**: support@campusconnect.com
- **Twitter**: @CampusConnectDev

---

**Built with ❤️ by the CampusConnect Team**

*Empowering students to connect, collaborate, and thrive on campus.*
