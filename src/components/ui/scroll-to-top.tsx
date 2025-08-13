'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ScrollToTopProps {
  showThreshold?: number; // Scroll position to show button (default: 300px)
  className?: string; // Additional CSS classes
  imageUrl?: string; // Custom image URL
  useImage?: boolean; // Use image or default icon
}

export function ScrollToTop({
  showThreshold = 300,
  className = '',
  imageUrl = '/assets/images/bg-backtotop.png',
  useImage = true,
}: ScrollToTopProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > showThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showThreshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 w-16 h-16 hover:scale-110 transition-all duration-300 animate__animated animate__fadeInUp ${className}`}
      aria-label="Scroll to top"
    >
      {useImage ? (
        <Image
          src={imageUrl}
          alt="Back to Top"
          width={64}
          height={64}
          className="w-full h-full object-contain drop-shadow-2xl hover:drop-shadow-3xl transition-all duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-full shadow-2xl flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
