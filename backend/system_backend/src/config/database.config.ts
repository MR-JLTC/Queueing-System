import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql', // Specify MySQL
  host: process.env.DB_HOST || 'localhost', // Usually 'localhost' for XAMPP
  port: parseInt(process.env.DB_PORT || '3306', 10), // Default MySQL port for XAMPP
  username: process.env.DB_USER || 'root', // Default XAMPP MySQL username
  password: process.env.DB_PASSWORD || '', // Default XAMPP MySQL password (often empty)
  database: process.env.DB_NAME || 'queue_system', // Your database name (create this in phpMyAdmin)
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Path to your entities
  synchronize: true, // Set to false in production! This will sync your entities with the database schema.
  logging: false, // Set to true for debugging SQL queries
};