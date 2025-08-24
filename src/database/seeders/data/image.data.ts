export const ALT_TEXT_TEMPLATES = [
  'Product front view',
  'Product back view', 
  'Product side angle',
  'Product in use',
  'Product details close-up',
  'Product packaging',
  'Product with accessories',
  'Product lifestyle shot',
  'Product on white background',
  'Product in natural lighting'
] as const;

export const IMAGE_CONFIG = {
  DEFAULT_WIDTH: 640,
  DEFAULT_HEIGHT: 480,
  BASE_URL: 'https://picsum.photos',
  MIN_IMAGES_PER_PRODUCT: 2,
  MAX_IMAGES_PER_PRODUCT: 5
} as const;

export type AltTextTemplate = typeof ALT_TEXT_TEMPLATES[number];