'use client';

import React from 'react';
import { generateBarcodeSvg } from '@/utils/barcodeGenerator';

export interface BarcodeVisualProps {
  text: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Component hiển thị mã vạch Barcode Code 128 thuần SVG.
 * Tuân thủ 7-Layer Architecture: Pure Presentation Component (không có useState / useEffect).
 */
export function BarcodeVisual({
  text,
  height = 34,
  barWidth,
  showText = true,
  className = '',
}: BarcodeVisualProps) {
  const svgMarkup = generateBarcodeSvg(text, { height, barWidth, showText });

  return (
    <div
      className={`w-full max-w-full overflow-hidden bg-white p-1 rounded-md flex items-center justify-center ${className}`}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
