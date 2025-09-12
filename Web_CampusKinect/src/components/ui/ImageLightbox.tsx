'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    console.log('🖼️ ImageLightbox isOpen changed:', isOpen, 'images:', images.length);
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      console.log('🖼️ Lightbox opened, body scroll locked');
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
      console.log('🖼️ Lightbox closed, body scroll restored');
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

  const lightboxContent = (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-all duration-400 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        zIndex: 2147483647, // Maximum z-index value
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: isVisible ? 'blur(10px)' : 'blur(0px)',
        pointerEvents: isVisible ? 'auto' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={handleBackgroundClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all duration-200 hover:scale-110"
        style={{ zIndex: 2147483648 }}
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
        className={`relative max-w-[90vw] max-h-[90vh] transition-all duration-400 ease-out transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
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

  // Render to document body using portal
  if (typeof document === 'undefined') {
    console.log('🖼️ Document undefined, not rendering lightbox');
    return null;
  }
  
  console.log('🖼️ Rendering lightbox to document.body');
  
  // Ensure we have a portal container
  let portalContainer = document.getElementById('lightbox-portal');
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.id = 'lightbox-portal';
    portalContainer.style.position = 'fixed';
    portalContainer.style.top = '0';
    portalContainer.style.left = '0';
    portalContainer.style.zIndex = '2147483647';
    portalContainer.style.pointerEvents = 'none';
    document.body.appendChild(portalContainer);
  }
  
  return createPortal(lightboxContent, portalContainer);
};

export default ImageLightbox; 