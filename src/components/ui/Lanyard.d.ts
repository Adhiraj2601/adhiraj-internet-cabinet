import type { ComponentType, CSSProperties } from 'react';

export interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
  isMobile?: boolean;
  frameloop?: 'always' | 'demand' | 'never';
  className?: string;
  style?: CSSProperties;
}

declare const Lanyard: ComponentType<LanyardProps>;
export default Lanyard;
