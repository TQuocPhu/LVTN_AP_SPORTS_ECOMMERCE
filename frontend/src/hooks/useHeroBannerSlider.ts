'use client';

import { useState, useEffect, useCallback } from 'react';

export const HERO_SLIDE_IMAGES = [
  '/images/banners/hero_banner_1.png',
  '/images/banners/hero_banner_2.png',
  '/images/banners/hero_banner_3.png',
  '/images/banners/hero_banner_4.png',
  '/images/banners/hero_banner_6.png',
];

/**
 * Custom Hook quản lý trạng thái và vòng đời chuyển slide tự động cho HeroBannerSlider.
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture: Không sử dụng useState/useEffect trong Component.
 */
export function useHeroBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDE_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === 0 ? HERO_SLIDE_IMAGES.length - 1 : prev - 1
    );
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDE_IMAGES.length);
  }, []);

  const goToSlide = useCallback((idx: number) => {
    setCurrentSlide(idx);
  }, []);

  return {
    slides: HERO_SLIDE_IMAGES,
    currentSlide,
    prevSlide,
    nextSlide,
    goToSlide,
  };
}
