# 🔐 CampusConnect Authentication UI Framework

## 📋 **Overview**
This document defines the complete UI framework for the CampusConnect authentication system, including signup, login, university verification, and profile setup flows.

## 🎯 **Design Philosophy**
- **Student-Focused** - Clean, intuitive interface for university students
- **University-Centric** - Email domain validation and university selection
- **Progressive Disclosure** - Step-by-step onboarding process
- **Mobile-First** - Responsive design optimized for mobile devices
- **Security-Conscious** - Clear security indicators and validation

## 🏗️ **Component Architecture**

### **1. Authentication Container**
```typescript
interface AuthenticationContainerProps {
  initialView: 'login' | 'signup';
  onAuthenticationSuccess: (user: User) => void;
  onClose: () => void;
}

const AuthenticationContainer: React.FC<AuthenticationContainerProps> = ({
  initialView,
  onAuthenticationSuccess,
  onClose
}) => {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'university-verification' | 'profile-setup'>(initialView);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  
  return (
    <div className="auth-container">
      {currentView === 'login' && (
        <LoginView 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setCurrentView('signup')}
          onClose={onClose}
        />
      )}
      
      {currentView === 'signup' && (
        <SignupView 
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setCurrentView('login')}
          onClose={onClose}
        />
      )}
      
      {currentView === 'university-verification' && (
        <UniversityVerificationView 
          authData={authData}
          onVerificationSuccess={handleVerificationSuccess}
          onBack={() => setCurrentView('signup')}
        />
      )}
      
      {currentView === 'profile-setup' && (
        <ProfileSetupView 
          authData={authData}
          onSetupComplete={handleSetupComplete}
          onBack={() => setCurrentView('university-verification')}
        />
      )}
    </div>
  );
};
```

### **2. Login View Component**
```typescript
interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToSignup: () => void;
  onClose: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onSwitchToSignup,
  onClose
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(formData);
      onLoginSuccess(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-view login-view">
      <div className="auth-header">
        <button className="close-button" onClick={onClose}>×</button>
        <h1>Welcome Back</h1>
        <p>Sign in to your CampusConnect account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="your.email@university.edu"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-primary auth-submit"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Don't have an account? 
          <button 
            className="link-button" 
            onClick={onSwitchToSignup}
            disabled={loading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};
```

### **3. Signup View Component**
```typescript
interface SignupViewProps {
  onSignupSuccess: (authData: AuthData) => void;
  onSwitchToLogin: () => void;
  onClose: () => void;
}

const SignupView: React.FC<SignupViewProps> = ({
  onSignupSuccess,
  onSwitchToLogin,
  onClose
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await signupUser(formData);
      onSignupSuccess(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-view signup-view">
      <div className="auth-header">
        <button className="close-button" onClick={onClose}>×</button>
        <h1>Join CampusConnect</h1>
        <p>Connect with students at your university</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="First name"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Last name"
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">University Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="your.email@university.edu"
            required
            disabled={loading}
          />
          <small className="form-help">
            Use your university email address
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Create a strong password"
            required
            disabled={loading}
          />
          <small className="form-help">
            At least 8 characters with numbers and symbols
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="Confirm your password"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
              disabled={loading}
            />
            <span className="checkmark"></span>
            I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
          </label>
        </div>
        
        <button 
          type="submit" 
          className="btn-primary auth-submit"
          disabled={loading || !formData.agreeToTerms}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Already have an account? 
          <button 
            className="link-button" 
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
```

### **4. University Verification Component**
```typescript
interface UniversityVerificationViewProps {
  authData: AuthData;
  onVerificationSuccess: (verificationData: VerificationData) => void;
  onBack: () => void;
}

const UniversityVerificationView: React.FC<UniversityVerificationViewProps> = ({
  authData,
  onVerificationSuccess,
  onBack
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await verifyEmail(authData.email, verificationCode);
      onVerificationSuccess(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    try {
      await resendVerificationCode(authData.email);
      setResendCountdown(60);
      const timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };
  
  return (
    <div className="auth-view verification-view">
      <div className="auth-header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1>Verify Your Email</h1>
        <p>We sent a verification code to {authData.email}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="verificationCode">Verification Code</label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
            disabled={loading}
            className="verification-code-input"
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-primary auth-submit"
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
      
      <div className="verification-footer">
        <p>Didn't receive the code?</p>
        <button 
          className="link-button resend-button"
          onClick={handleResendCode}
          disabled={resendCountdown > 0 || loading}
        >
          {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
};
```

### **5. Profile Setup Component**
```typescript
interface ProfileSetupViewProps {
  authData: AuthData;
  onSetupComplete: (user: User) => void;
  onBack: () => void;
}

const ProfileSetupView: React.FC<ProfileSetupViewProps> = ({
  authData,
  onSetupComplete,
  onBack
}) => {
  const [formData, setFormData] = useState({
    year: '',
    major: '',
    hometown: '',
    profilePicture: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await completeProfileSetup(authData, formData);
      onSetupComplete(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageUpload = (file: File) => {
    setFormData({...formData, profilePicture: file});
  };
  
  return (
    <div className="auth-view profile-setup-view">
      <div className="auth-header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1>Complete Your Profile</h1>
        <p>Help others get to know you better</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-group profile-picture-group">
          <label>Profile Picture</label>
          <div className="profile-picture-upload">
            <div className="upload-preview">
              {formData.profilePicture ? (
                <img 
                  src={URL.createObjectURL(formData.profilePicture)} 
                  alt="Profile preview" 
                />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <span>Add Photo</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              disabled={loading}
            />
          </div>
          <small className="form-help">
            Optional: Add a profile picture to help others recognize you
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="year">Year in School</label>
          <select
            id="year"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            required
            disabled={loading}
          >
            <option value="">Select your year</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
            <option value="5">Fifth Year+</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="major">Major/Field of Study</label>
          <input
            type="text"
            id="major"
            value={formData.major}
            onChange={(e) => setFormData({...formData, major: e.target.value})}
            placeholder="e.g., Computer Science, Business, Engineering"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="hometown">Hometown</label>
          <input
            type="text"
            id="hometown"
            value={formData.hometown}
            onChange={(e) => setFormData({...formData, hometown: e.target.value})}
            placeholder="e.g., San Francisco, CA"
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-primary auth-submit"
          disabled={loading}
        >
          {loading ? 'Setting Up Profile...' : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
};
```

## 🎨 **CSS Implementation**

### **Base Authentication Styles**
```css
.auth-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.auth-view {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.auth-header {
  padding: var(--space-6);
  text-align: center;
  border-bottom: 1px solid var(--bg-tertiary);
  position: relative;
}

.auth-header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.auth-header p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

.close-button,
.back-button {
  position: absolute;
  top: var(--space-6);
  left: var(--space-6);
  background: none;
  border: none;
  font-size: var(--text-2xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.close-button:hover,
.back-button:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.auth-form {
  padding: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background-color: var(--bg-primary);
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-blue);
}

.form-help {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.auth-submit {
  width: 100%;
  padding: var(--space-4);
  background-color: var(--primary-blue);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.auth-submit:hover:not(:disabled) {
  background-color: var(--primary-blue-dark);
}

.auth-submit:disabled {
  background-color: var(--text-tertiary);
  cursor: not-allowed;
}

.auth-footer {
  padding: var(--space-6);
  text-align: center;
  border-top: 1px solid var(--bg-tertiary);
}

.link-button {
  background: none;
  border: none;
  color: var(--primary-blue);
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
}

.link-button:hover {
  color: var(--primary-blue-dark);
}

.error-message {
  background-color: var(--error-red);
  color: var(--bg-primary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

/* Profile Picture Upload */
.profile-picture-group {
  text-align: center;
}

.profile-picture-upload {
  position: relative;
  display: inline-block;
}

.upload-preview {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  border: 2px dashed var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-3);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.upload-preview:hover {
  border-color: var(--primary-blue);
}

.upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
}

.upload-icon {
  font-size: var(--text-2xl);
}

.profile-picture-upload input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Verification Code Input */
.verification-code-input {
  text-align: center;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  letter-spacing: var(--space-2);
}

/* Responsive Design */
@media (max-width: 480px) {
  .auth-container {
    padding: var(--space-4);
  }
  
  .auth-view {
    border-radius: var(--radius-lg);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .upload-preview {
    width: 100px;
    height: 100px;
  }
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 📱 **Responsive Design**

### **Mobile-First Approach**
- **Touch-friendly inputs** - Adequate button and input sizes
- **Simplified layouts** - Single-column forms on mobile
- **Optimized spacing** - Appropriate margins and padding
- **Gesture support** - Swipe to dismiss (optional)

### **Desktop Enhancements**
- **Multi-column layouts** - Form fields side-by-side
- **Hover effects** - Interactive feedback
- **Keyboard navigation** - Tab order and shortcuts
- **Larger touch targets** - Better desktop experience

## 🔒 **Security Features**

### **Input Validation**
- **Real-time validation** - Immediate feedback
- **Server-side validation** - Backend security
- **Password strength** - Visual indicators
- **Email format** - University domain validation

### **User Experience**
- **Loading states** - Clear feedback during operations
- **Error handling** - User-friendly error messages
- **Success feedback** - Confirmation of actions
- **Progressive disclosure** - Step-by-step flow

## 🎯 **Accessibility Features**

### **Screen Reader Support**
- **Proper labeling** - All inputs have labels
- **ARIA attributes** - Role and state information
- **Focus management** - Logical tab order
- **Error announcements** - Screen reader notifications

### **Keyboard Navigation**
- **Tab order** - Logical form progression
- **Enter key** - Form submission
- **Escape key** - Modal dismissal
- **Arrow keys** - Dropdown navigation

## 📋 **Implementation Notes**

### **State Management**
- **Form state** - Controlled inputs with validation
- **Loading states** - Disabled inputs during operations
- **Error handling** - User-friendly error display
- **Navigation state** - View transitions

### **API Integration**
- **Authentication endpoints** - Login, signup, verification
- **Error handling** - Network and validation errors
- **Success flows** - User data and tokens
- **Session management** - JWT token storage

This UI framework provides a complete, accessible, and user-friendly authentication system that guides students through the signup process while maintaining security and usability standards. 