import { Sequelize } from 'sequelize';

// Single Sequelize instance for the whole app
export const sequelize = new Sequelize('rental_db', 'postgres', 'postgres', {
  host: 'db',  // This matches the service name in docker-compose
  dialect: 'postgres',
  port: 5432,
  pool: {
    max: 20,
    idle: 30000,
    acquire: 60000,
  },
  logging: true
});

// Simple test function
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

// Test the connection
await testConnection();
