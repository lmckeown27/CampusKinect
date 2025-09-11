'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (images.length > 1) {
      setImageLoaded(false);
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
  }, [images.length]);

  const goToNext = useCallback(() => {
    if (images.length > 1) {
      setImageLoaded(false);
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      goToNext();
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious();
    }
  };

  // Handle background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get image URL with proper formatting
  const getImageUrl = (image: string) => {
    if (image.startsWith("/uploads/")) {
      return `${typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : 'https://campuskinect.net'}${image}`;
    }
    return image;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: isVisible ? 'blur(4px)' : 'blur(0px)',
      }}
      onClick={handleBackgroundClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Close image viewer"
      >
        <X size={24} />
      </button>

      {/* Image counter (only show if multiple images) */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 z-60 px-3 py-2 bg-black bg-opacity-50 text-white rounded-lg text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Navigation buttons (only show if multiple images) */}
      {images.length > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Image container */}
      <div 
        className={`relative max-w-[95vw] max-h-[95vh] transition-all duration-500 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading overlay */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Main image */}
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`Image ${currentIndex + 1} of ${images.length}`}
          className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.error('Failed to load image:', images[currentIndex]);
            setImageLoaded(true);
          }}
          draggable={false}
        />
      </div>

      {/* Image dots indicator (only show if multiple images) */}
      {images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setImageLoaded(false);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe gesture indicators for mobile */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70 md:hidden">
          Swipe left or right to navigate
        </div>
      )}
    </div>
  );
};

export default ImageLightbox; 