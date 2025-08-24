export interface ProductTemplate {
  name: string;
  description: string;
  basePrice: number;
  category: string;
}

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    name: 'iPhone 15 Pro',
    description: 'The latest Apple iPhone with A17 Pro chip and titanium design',
    basePrice: 999.99,
    category: 'Electronics'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen and AI features',
    basePrice: 1199.99,
    category: 'Electronics'
  },
  {
    name: 'MacBook Air M3',
    description: 'Lightweight laptop with Apple M3 chip and all-day battery',
    basePrice: 1299.99,
    category: 'Computers'
  },
  {
    name: 'Dell XPS 13',
    description: 'Ultra-portable Windows laptop with InfinityEdge display',
    basePrice: 1099.99,
    category: 'Computers'
  },
  {
    name: 'AirPods Pro (2nd Gen)',
    description: 'Wireless earbuds with active noise cancellation and spatial audio',
    basePrice: 249.99,
    category: 'Audio'
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with 30-hour battery',
    basePrice: 399.99,
    category: 'Audio'
  },
  {
    name: 'iPad Pro 12.9"',
    description: 'Most advanced iPad with M2 chip and Liquid Retina XDR display',
    basePrice: 1099.99,
    category: 'Tablets'
  },
  {
    name: 'Microsoft Surface Pro 9',
    description: 'Versatile 2-in-1 laptop with detachable keyboard and Surface Pen',
    basePrice: 999.99,
    category: 'Tablets'
  },
  {
    name: 'Apple Watch Ultra 2',
    description: 'Most rugged Apple Watch with precision GPS and 36-hour battery',
    basePrice: 799.99,
    category: 'Wearables'
  },
  {
    name: 'Garmin Fenix 7X',
    description: 'Premium multisport GPS watch with solar charging',
    basePrice: 899.99,
    category: 'Wearables'
  },
  {
    name: 'Nintendo Switch OLED',
    description: 'Portable gaming console with vibrant 7-inch OLED screen',
    basePrice: 349.99,
    category: 'Gaming'
  },
  {
    name: 'Steam Deck',
    description: 'Handheld gaming PC that runs your Steam library',
    basePrice: 649.99,
    category: 'Gaming'
  },
  {
    name: 'Canon EOS R5',
    description: 'Professional mirrorless camera with 8K video recording',
    basePrice: 3899.99,
    category: 'Cameras'
  },
  {
    name: 'GoPro Hero 12',
    description: 'Ultra-compact action camera with 5.3K video and HyperSmooth',
    basePrice: 399.99,
    category: 'Cameras'
  },
  {
    name: 'Dyson V15 Detect',
    description: 'Cordless vacuum with laser dust detection and LCD screen',
    basePrice: 749.99,
    category: 'Home'
  },
  {
    name: 'Nest Thermostat',
    description: 'Smart thermostat that learns your schedule and saves energy',
    basePrice: 249.99,
    category: 'Home'
  },
  {
    name: 'Kindle Oasis',
    description: 'Premium e-reader with 7-inch display and adjustable warm light',
    basePrice: 279.99,
    category: 'Books'
  },
  {
    name: 'JBL Flip 6',
    description: 'Portable Bluetooth speaker with powerful sound and IP67 rating',
    basePrice: 129.99,
    category: 'Audio'
  },
  {
    name: 'Fitbit Versa 4',
    description: 'Health and fitness smartwatch with GPS and 6+ day battery',
    basePrice: 199.99,
    category: 'Wearables'
  },
  {
    name: 'Roku Ultra',
    description: '4K streaming device with Dolby Vision and voice remote',
    basePrice: 99.99,
    category: 'Electronics'
  }
];

export const CATEGORIES = [
  'Electronics',
  'Computers', 
  'Audio',
  'Tablets',
  'Wearables',
  'Gaming',
  'Cameras',
  'Home',
  'Books'
] as const;

export type ProductCategory = typeof CATEGORIES[number];