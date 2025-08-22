# Nest Payment Checkout Backend

Aplicación backend desarrollada con NestJS para manejo de pagos y checkout.

## Configuración Inicial

### Prerrequisitos
- Node.js (versión 22 o superior)
- npm
- PostgreSQL

### Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/sergiovegam41/nest-payment-checkout-back.git
cd nest-payment-checkout-back
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar el archivo `.env` con tus configuraciones específicas.

### Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## Estructura del Proyecto

```
src/
├── modules/          # Módulos de la aplicación
├── common/           # Utilidades compartidas
├── config/           # Configuraciones
└── main.ts          # Punto de entrada
```

## API Endpoints

La documentación de la API estará disponible en:
- Desarrollo: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api-docs`

## Tecnologías

- **Framework**: NestJS
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Pagos**: Wompi (Adapter Pattern)