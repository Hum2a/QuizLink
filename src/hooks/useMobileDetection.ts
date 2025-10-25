import { useState, useEffect } from 'react';

export interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  userAgent: string;
  touchSupport: boolean;
}

export const useMobileDetection = (): MobileInfo => {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    userAgent: '',
    touchSupport: false,
  });

  useEffect(() => {
    const updateMobileInfo = () => {
      const userAgent = navigator.userAgent;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Touch support detection
      const touchSupport =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;

      // Mobile detection
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        ) ||
        (touchSupport && screenWidth <= 768);

      // Tablet detection
      const isTablet =
        /iPad|Android(?!.*Mobile)/i.test(userAgent) ||
        (touchSupport && screenWidth > 768 && screenWidth <= 1024);

      // Desktop detection
      const isDesktop = !isMobile && !isTablet;

      // Orientation detection
      const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';

      setMobileInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth,
        screenHeight,
        orientation,
        userAgent,
        touchSupport,
      });
    };

    // Initial detection
    updateMobileInfo();

    // Listen for resize events
    window.addEventListener('resize', updateMobileInfo);
    window.addEventListener('orientationchange', updateMobileInfo);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateMobileInfo);
      window.removeEventListener('orientationchange', updateMobileInfo);
    };
  }, []);

  return mobileInfo;
};

export default useMobileDetection;
