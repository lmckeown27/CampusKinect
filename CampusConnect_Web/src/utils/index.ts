import { type ClassValue, clsx } from 'clsx';

// Merge classes with clsx (simplified version without tailwind-merge)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours}h ago`;
  } else if (diffInHours < 168) { // 7 days
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  } else {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Duration formatting
export function formatDuration(duration: string): string {
  if (duration === 'ongoing') return 'Ongoing';
  if (duration === 'one-time') return 'One-time';
  if (duration.includes('recurring')) return 'Recurring';
  return duration;
}

// Post type utilities - Updated to use custom CSS classes
export function getPostTypeColor(postType: string): string {
  const colors = {
    // Frontend categories
    goods: 'badge-goods',
    services: 'badge-services',
    events: 'badge-event',
    housing: 'badge-housing',
    tutoring: 'badge-tutoring',
    // Backend action types
    offer: 'badge-goods',
    request: 'badge-services', 
    event: 'badge-event',
  };
  return colors[postType as keyof typeof colors] || 'badge';
}

export function getPostTypeIcon(postType: string): string {
  const icons = {
    // Frontend categories
    goods: '📦',
    services: '🔧',
    events: '🎉',
    housing: '🏠',
    tutoring: '📚',
    // Backend action types
    offer: '📦',
    request: '🔍', 
    event: '🎉',
  };
  return icons[postType as keyof typeof icons] || '📝';
}

// Grade utilities - Updated to use custom CSS classes
export function getGradeColor(grade: number): string {
  if (grade >= 90) return 'text-success';
  if (grade >= 80) return 'text-primary';
  if (grade >= 70) return 'text-warning';
  if (grade >= 60) return 'text-warning';
  return 'text-error';
}

export function getGradeLabel(grade: number): string {
  if (grade >= 90) return 'A+';
  if (grade >= 80) return 'A';
  if (grade >= 70) return 'B';
  if (grade >= 60) return 'C';
  return 'D';
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isEducationalEmail(email: string): boolean {
  const eduDomains = ['.edu', '.ac.uk', '.ca', '.edu.au', '.de', '.fr'];
  return eduDomains.some(domain => email.toLowerCase().includes(domain));
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  return validTypes.includes(file.type) && file.size <= maxSize;
}

// Search utilities
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

// URL utilities
export function getUniversityFromEmail(email: string): string {
  const domain = email.split('@')[1];
  if (!domain) return '';
  
  // Extract university name from domain
  const parts = domain.split('.');
  if (parts.length >= 2) {
    return parts[parts.length - 2].charAt(0).toUpperCase() + 
           parts[parts.length - 2].slice(1);
  }
  return domain;
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Error handling
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
}

// Number formatting
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Time utilities
export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
} 