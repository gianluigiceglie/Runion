import type { ScreenBackgroundVariant } from '../components/ScreenBackground/ScreenBackground';
import { photos } from '../assets/photos';

export interface Slide {
  title: string;
  body: string;
  background: ScreenBackgroundVariant;
  /** [back-left, back-right, front] photo URLs (Figma Image1 layers); undefined = placeholder card. */
  photos: [string | undefined, string | undefined, string | undefined];
}

/** Copy from Figma "↳ Slider" (light frames). */
export const SLIDES: Slide[] = [
  {
    title: 'Run with those who match your pace.',
    body: 'Find the ideal running partner based on your speed, location, and routine, without wasted small talk.',
    background: 'slide1',
    photos: [photos[0], photos[1], photos[2]],
  },
  {
    title: 'Running that fits around your agenda.',
    body: 'Set your free time slots and connect with runners ready to head out right when you are.',
    background: 'slide2',
    photos: [photos[3], photos[4], photos[5]],
  },
  {
    title: 'Real profiles and accurate paces.',
    body: 'AI Face Check and community feedback ensure you only connect with reliable, safe runners.',
    background: 'slide3',
    photos: [photos[6], photos[7], photos[8]],
  },
];
