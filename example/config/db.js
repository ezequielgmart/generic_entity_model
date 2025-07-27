// src/config/db.js
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables. This should happen regardless of pool initialization.
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: './.env.test' });
} else {
    dotenv.config();
}

const { Pool } = pg;

// Declare a variable to hold the pool instance
let poolInstance = null;

/**
 * Initializes the PostgreSQL connection pool.
 * This function should be called explicitly when the pool is needed.
 * Ensures the pool is a singleton (only one instance is created).
 */
export function initPool() {
    if (poolInstance) {
        return poolInstance; // Return existing instance if already initialized
    }

    const dbConfig = {
        user: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_USER : process.env.DB_USER,
        host: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_HOST : process.env.DB_HOST,
        database: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_DATABASE : process.env.DB_DATABASE,
        password: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_PASSWORD : process.env.DB_PASSWORD,
        port: process.env.NODE_ENV === 'test' ? parseInt(process.env.TEST_DB_PORT, 10) : parseInt(process.env.DB_PORT, 10),
    };

    poolInstance = new Pool(dbConfig);

    // Error handling for the pool connection
    poolInstance.on('error', (err, client) => {
        console.error('Unexpected error on PostgreSQL:', err);
        if (process.env.NODE_ENV !== 'test') { // In production, exit on critical DB error
            process.exit(-1);
        }
    });

    return poolInstance;
}

/**
 * Gets the current pool instance.
 * Throws an error if the pool has not been initialized.
 * This is the default export for convenience in modules that expect a direct 'pool' import.
 */
const getPool = () => {
    if (!poolInstance) {
        // This error indicates a programming mistake: pool was used before initPool was called.
        throw new Error('Database pool has not been initialized. Call initPool() first.');
    }
    return poolInstance;
};

export default getPool; // Export the getter as default
