'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const { register, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    year: undefined as number | undefined,
    major: '',
    hometown: '',
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await register(formData);
    } catch (error) {
      // Error is handled by the store
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
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (!isEducationalEmail(formData.email)) {
      errors.email = 'Please use your educational email address (.edu, .ac.uk, etc.)';
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

  const years = [
    { value: 1, label: 'Freshman' },
    { value: 2, label: 'Sophomore' },
    { value: 3, label: 'Junior' },
    { value: 4, label: 'Senior' },
    { value: 5, label: 'Super Senior' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 w-full">
          <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center mb-6 shadow-xl">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 
            className="text-3xl font-bold text-neutral-900 mb-2 w-full"
            style={{ textAlign: 'center' }}
          >
            <span className="text-primary">CampusKinect</span>
          </h1>
          <p 
            className="text-neutral-600 w-full"
            style={{ textAlign: 'center' }}
          >
            Create your account to get started
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-box-xl p-6 border border-neutral-100" style={{ width: '400px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} className="space-y-8" style={{ marginBottom: '2rem' }}>
            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '2rem' }}>
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
                  className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder=""
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
                  className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder=""
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            </div>

            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="email" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder=""
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
                {formData.email && !validationErrors.email && isEducationalEmail(formData.email) && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    Valid educational email
                  </p>
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
                    className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
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
                    className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
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
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Academic Year */}
            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="year" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Academic Year (optional)
                </label>
                <select
                  id="year"
                  value={formData.year || ''}
                  onChange={(e) => handleInputChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 bg-white text-sm border-olive-green"
                >
                  <option value="" disabled>Select your year</option>
                  {years.map(year => (
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>
                {validationErrors.year && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.year}</p>
                )}
              </div>
            </div>

            {/* Major */}
            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="major" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Major (optional)
                </label>
                <input
                  type="text"
                  id="major"
                  value={formData.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder=""
                />
                {validationErrors.major && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.major}</p>
                )}
              </div>
            </div>

            {/* Hometown */}
            <div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
              <div className="relative" style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <label htmlFor="hometown" className="absolute -top-2 left-3 text-base font-medium text-neutral-700 z-10 bg-white px-1">
                  Hometown (optional)
                </label>
                <input
                  type="text"
                  id="hometown"
                  value={formData.hometown}
                  onChange={(e) => handleInputChange('hometown', e.target.value)}
                  className="w-full pt-10 pb-6 px-4 border-2 rounded-md focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-neutral-900 placeholder-neutral-400 text-lg border-olive-green"
                  placeholder=""
                />
                {validationErrors.hometown && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.hometown}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="pt-4">
              <div style={{ width: '320px', margin: '0 auto', display: 'block' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-6 border border-transparent rounded-md text-lg font-semibold text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ 
                    backgroundColor: '#708d81',
                    backgroundImage: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5a7268';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
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

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-600 font-medium underline decoration-2 underline-offset-2">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 