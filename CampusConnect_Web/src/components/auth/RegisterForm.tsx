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
    year: 1,
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

    if (!formData.major.trim()) {
      errors.major = 'Major is required';
    }

    if (!formData.hometown.trim()) {
      errors.hometown = 'Hometown is required';
    }

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 w-full">
          <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
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
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 placeholder-neutral-400"
                  placeholder="First name"
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 placeholder-neutral-400"
                  placeholder="Last name"
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 placeholder-neutral-400"
                placeholder="Enter your email"
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

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-neutral-700 mb-2">
                Academic Year
              </label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                required
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 bg-white"
              >
                <option value="">Select your year</option>
                {years.map(year => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
              {validationErrors.year && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.year}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 placeholder-neutral-400"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 placeholder-neutral-400"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Major */}
            <div>
              <label htmlFor="major" className="block text-sm font-medium text-neutral-700 mb-2">
                Major *
              </label>
              <input
                type="text"
                id="major"
                value={formData.major}
                onChange={(e) => handleInputChange('major', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 placeholder-neutral-400"
                placeholder="e.g., Computer Science"
              />
              {validationErrors.major && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.major}</p>
              )}
            </div>

            {/* Hometown */}
            <div>
              <label htmlFor="hometown" className="block text-sm font-medium text-neutral-700 mb-2">
                Hometown *
              </label>
              <input
                type="text"
                id="hometown"
                value={formData.hometown}
                onChange={(e) => handleInputChange('hometown', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-neutral-900 placeholder-neutral-400"
                placeholder="Where are you from?"
              />
              {validationErrors.hometown && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.hometown}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 