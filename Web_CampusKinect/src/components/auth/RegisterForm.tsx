'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { User } from '../../types';
import KinectLogo from '@/assets/logos/KinectLogo.png';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Redirect to verification page after successful registration
  useEffect(() => {
    if (registrationSuccess && isEmailValidForRegistration(formData.email)) {
      console.log('useEffect: Valid email and success state - redirecting to verification page');
      router.push('/auth/verify');
    } else if (registrationSuccess) {
      console.log('useEffect: Success state but invalid email - not redirecting');
    }
  }, [registrationSuccess, router, formData.email]);

  // Helper function to check if email is valid for registration
  const isEmailValidForRegistration = (email: string): boolean => {
    return isValidEmail(email) && isEducationalEmail(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed, not submitting');
      return;
    }
    
    // Check if email is valid before proceeding
    if (!isEmailValidForRegistration(formData.email)) {
      console.log('Invalid email format or not educational email - not redirecting');
      return;
    }
    
    try {
      console.log('Starting registration...');
      console.log('Form data:', formData);
      
      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...registrationData } = formData;
      
      const result = await register(registrationData);
      setRegistrationSuccess(true);
      
      // Store email in localStorage for verification page
      if (typeof window !== 'undefined') {
        localStorage.setItem('registrationEmail', formData.email);
      }
      router.push('/auth/verify');
      
    } catch (error: any) {
      console.error('Registration failed:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Check password strength
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'University email address is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid university email address';
    } else if (!isEducationalEmail(formData.email)) {
      errors.email = 'Please use your educational university email address (.edu, .ac.uk, etc.)';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Major and hometown are optional fields

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEducationalEmail = (email: string): boolean => {
    const eduDomains = ['.edu', '.ac.uk', '.ca', '.edu.au', '.de', '.fr'];
    return eduDomains.some(domain => email.toLowerCase().includes(domain));
  };

  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return 'text-red-600';
    if (strength <= 3) return 'text-yellow-600';
    if (strength <= 4) return 'text-blue-600';
    return 'text-green-600';
  };



  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pb-24" style={{ backgroundColor: '#525252' }}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 w-full">
                      <img 
              src={KinectLogo.src} 
              alt="Kinect Logo" 
              className="h-12 w-12 rounded-lg mb-6 shadow-xl object-contain"
            />
          <h1 
            className="text-3xl font-bold text-neutral-900 mb-2 w-full"
            style={{ textAlign: 'center' }}
          >
            <span className="text-primary">CampusKinect</span>
          </h1>
          <p 
            className="text-white w-full"
            style={{ textAlign: 'center' }}
          >
            Create your account to get started
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-box-xl p-6 border border-neutral-100" style={{ width: '400px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} className="space-y-8" style={{ marginBottom: '2rem' }}>
            
            {/* Username */}
            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="username" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="new-password"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder="your_username"
                />
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                )}
              </div>
            </div>

            <div className="space-y-6" style={{ marginBottom: '1.5rem' }}>
                          <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="firstName" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  className="w-full pt-6 pb-3 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder="First Name"
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>
            </div>
                          <div className="space-y-3">
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="lastName" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  className="w-full pt-6 pb-3 px-4 border-2 rounded-md focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder="Last Name"
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            </div>

            {/* University Email Address */}
            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="email" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  University Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="email"
                    spellCheck="false"
                    className="w-full pt-6 pb-3 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                    placeholder="yourname@yourcollege.edu"
                  />
                  {formData.email && !isEducationalEmail(formData.email) && (
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <p style={{ color: 'red', fontSize: '14px', fontWeight: '500' }}>Use university email</p>
                    </div>
                  )}
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="password" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="new-password"
                    spellCheck="false"
                    className="w-full pt-6 pb-3 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                    placeholder=""
                  />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary hover:text-primary-600 transition-colors bg-transparent border-none"
                  style={{ background: 'transparent', boxShadow: 'none' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password strength:</span>
                    <span className={getPasswordStrengthColor(passwordStrength)}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="mt-1 flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-red-500'
                              : passwordStrength <= 3
                              ? 'bg-yellow-500'
                              : passwordStrength <= 4
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>
          </div>

            {/* Confirm Password */}
            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="confirmPassword" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Confirm password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="new-password"
                    spellCheck="false"
                    className="w-full pt-6 pb-3 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                    placeholder=""
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary hover:text-primary-600 transition-colors bg-transparent border-none"
                    style={{ background: 'transparent', boxShadow: 'none' }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-20 flex items-center pointer-events-none">
                      <p style={{ color: 'red', fontSize: '14px', fontWeight: '500' }}>Passwords must match</p>
                    </div>
                  )}
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>



            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}

            {registrationSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <p className="text-sm font-medium text-green-700">
                    Account created successfully! Please check your university email for a verification code.
                  </p>
                </div>
                <div className="mt-3 text-center">
                  <Link 
                    href="/auth/verify" 
                    className="text-primary hover:text-primary-600 font-medium text-sm underline decoration-2 underline-offset-2"
                  >
                    Click here to verify your email
                  </Link>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <p className="text-sm font-medium text-blue-700">
                    Creating your account...
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <div style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-6 border border-transparent rounded-md text-lg font-semibold text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ 
                    backgroundColor: '#708d81',
                    backgroundImage: 'none',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#5a7268';
                      e.currentTarget.style.cursor = 'pointer';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#708d81';
                      e.currentTarget.style.cursor = 'default';
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/login" 
              className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
            >
              ← Have an Account?
            </Link>
          </div>
        </div>

        {/* Apple Guideline 1.2 Compliance Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <Shield size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-semibold text-sm">Zero Tolerance Policy</p>
              <p className="text-red-700 text-xs mt-1">
                CampusKinect has ZERO TOLERANCE for objectionable content or abusive behavior. 
                All content is monitored and violations result in immediate account termination.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#708d81] mt-8">
          <p className="font-semibold mb-2">By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
              Privacy Policy
            </Link>
          </p>
          <p className="mt-2">
            Need help?{' '}
            <Link href="/support" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
              Visit our Support Center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 
