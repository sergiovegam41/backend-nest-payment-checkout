#!/usr/bin/env node

import { SeedService, SeederStrategyType } from './seeders/seed.service';

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const strategyArg = args.find(arg => arg.startsWith('--strategy='));
  const seedersArg = args.find(arg => arg.startsWith('--seeders='));
  const helpArg = args.includes('--help') || args.includes('-h');

  if (helpArg) {
    showHelp();
    return;
  }

  const strategy = strategyArg 
    ? strategyArg.split('=')[1] as SeederStrategyType 
    : 'prisma';

  const seedService = new SeedService();

  try {
    // Validate strategy
    if (!seedService.getAvailableStrategies().includes(strategy)) {
      console.error(`❌ Invalid strategy: ${strategy}`);
      
      process.exit(1);
    }

    if (seedersArg) {
      // Run specific seeders
      const seederNames = seedersArg.split('=')[1].split(',');
      await seedService.runSpecific(seederNames, strategy);
    } else {
      // Run all seeders
      await seedService.run(strategy);
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🌱 Database Seeding Tool

Usage:
  npm run seed                                    # Run all seeders with Prisma
  npm run seed -- --strategy=prisma             # Run all seeders with Prisma  
  npm run seed -- --strategy=json               # Run all seeders to JSON files
  npm run seed -- --seeders=ProductSeeder       # Run specific seeder
  npm run seed -- --seeders=ProductSeeder,UserSeeder --strategy=json

Options:
  --strategy=<type>    Database strategy to use (prisma|json)
  --seeders=<names>    Comma-separated list of specific seeders to run
  --help, -h          Show this help message

Examples:
  npm run seed                                   # Seed database with all data
  npm run seed -- --strategy=json               # Export seed data to JSON files
  npm run seed -- --seeders=ProductSeeder       # Only seed products
  
Available Seeders:
  - ProductSeeder: Creates products and product images

Available Strategies:
  - prisma: Insert data directly into database
  - json: Export data to JSON files for inspection
  `);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the main function
main();