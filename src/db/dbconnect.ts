import { Pool } from "pg";
import { type PoolConfig } from "pg";

const dbConfig: PoolConfig = {
  user: "postgres",
  host: "localhost",
  database: "car_rental",
  password: "postgres",
  port: 5432,
  // maximum number of clients in the pool
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const sequelize = new Sequelize('car_rental', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432
})

const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Connected to database");
    client.release();
    return true;
  } catch (err) {
    console.log("Error connecting to database", err);
    return false;
  }
}

await testConnection();