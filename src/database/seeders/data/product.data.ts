export interface ProductTemplate {
  name: string;
  description: string;
  basePrice: number;
  category: string;
}

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    name: 'iPhone 15 Pro',
    description: 'El último iPhone de Apple con chip A17 Pro y diseño de titanio',
    basePrice: 4199990,
    category: 'Electronics'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Smartphone Android premium con S Pen y funciones de IA',
    basePrice: 4999990,
    category: 'Electronics'
  },
  {
    name: 'MacBook Air M3',
    description: 'Portátil liviano con chip Apple M3 y batería de todo el día',
    basePrice: 5499990,
    category: 'Computers'
  },
  {
    name: 'Dell XPS 13',
    description: 'Portátil ultracompacto Windows con pantalla InfinityEdge',
    basePrice: 4699990,
    category: 'Computers'
  },
  {
    name: 'AirPods Pro (2da Gen)',
    description: 'Audífonos inalámbricos con cancelación activa de ruido y audio espacial',
    basePrice: 1049990,
    category: 'Audio'
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Audífonos con cancelación de ruido líder en la industria y batería de 30 horas',
    basePrice: 1699990,
    category: 'Audio'
  },
  {
    name: 'iPad Pro 12.9"',
    description: 'iPad más avanzado con chip M2 y pantalla Liquid Retina XDR',
    basePrice: 4699990,
    category: 'Tablets'
  },
  {
    name: 'Microsoft Surface Pro 9',
    description: 'Portátil 2 en 1 versátil con teclado desmontable y Surface Pen',
    basePrice: 4199990,
    category: 'Tablets'
  },
  {
    name: 'Apple Watch Ultra 2',
    description: 'Apple Watch más resistente con GPS de precisión y batería de 36 horas',
    basePrice: 3399990,
    category: 'Wearables'
  },
  {
    name: 'Garmin Fenix 7X',
    description: 'Reloj GPS multideporte premium con carga solar',
    basePrice: 3799990,
    category: 'Wearables'
  },
  {
    name: 'Nintendo Switch OLED',
    description: 'Consola de juegos portátil con pantalla OLED vibrante de 7 pulgadas',
    basePrice: 1499990,
    category: 'Gaming'
  },
  {
    name: 'Steam Deck',
    description: 'PC de juegos portátil que ejecuta tu biblioteca de Steam',
    basePrice: 2799990,
    category: 'Gaming'
  },
  {
    name: 'Canon EOS R5',
    description: 'Cámara mirrorless profesional con grabación de video 8K',
    basePrice: 16499990,
    category: 'Cameras'
  },
  {
    name: 'GoPro Hero 12',
    description: 'Cámara de acción ultracompacta con video 5.3K e HyperSmooth',
    basePrice: 1699990,
    category: 'Cameras'
  },
  {
    name: 'Dyson V15 Detect',
    description: 'Aspiradora inalámbrica con detección láser de polvo y pantalla LCD',
    basePrice: 3199990,
    category: 'Home'
  },
  {
    name: 'Nest Thermostat',
    description: 'Termostato inteligente que aprende tu horario y ahorra energía',
    basePrice: 1049990,
    category: 'Home'
  },
  {
    name: 'Kindle Oasis',
    description: 'E-reader premium con pantalla de 7 pulgadas y luz cálida ajustable',
    basePrice: 1199990,
    category: 'Books'
  },
  {
    name: 'JBL Flip 6',
    description: 'Altavoz Bluetooth portátil con sonido potente y clasificación IP67',
    basePrice: 549990,
    category: 'Audio'
  },
  {
    name: 'Fitbit Versa 4',
    description: 'Smartwatch de salud y fitness con GPS y batería de más de 6 días',
    basePrice: 849990,
    category: 'Wearables'
  },
  {
    name: 'Roku Ultra',
    description: 'Dispositivo de streaming 4K con Dolby Vision y control remoto por voz',
    basePrice: 419990,
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