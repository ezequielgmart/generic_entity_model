# Generic Entity Model (GEM)
This repository contains a foundational **Generic Entity Model (GEM)** designed to streamline database interactions in **Node.js applications** using **PostgreSQL**. It serves as an agnostic set of tools for performing standard **CRUD (Create, Read, Update, Delete)** operations, abstracting away the direct **pg** client calls and connection management.

## Note before implementation: 

* **Intro**: While this project aims to be used indepently of the db engine used (postgreSQL, mysql) currently is only working with potgreSQL and their usability relies on a db.js config file on the config folder on your project. 

This is how the expected config/db.js should like: 

```javascript
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
```

However, while this type of configuration is recommeded, this approach thinking on .env settings. The only thing that the entities functions (singleQueryModels, manyToManyQueryModels) are expecting is the getPool function where you are able to retrain the pg.Pool. 

* **dependencies**: the current version will be installing pg for postgreSQL interactions.

## Key Features:

* Database Agnostic Core: The GenericEntityModel is designed to be independent of specific database configuration files. It receives a getPoolFn (a function to retrieve the PostgreSQL connection pool) via its constructor, ensuring flexibility and testability.

* Centralized Query Execution: All database queries (insert, select, update, delete) are routed through internal helper methods (_queryWithParams, _singleQuery), which handle connecting to the database, executing the query, and releasing the client back to the pool.

* Basic Error Handling: Includes generic error handling for common database issues, such as unique constraint violations (23505), translating them into more readable application-level errors.

* Entity Mapping: Automatically maps database results to instances of your defined Entity Models (e.g., User, Author, Book), promoting a clean separation between your data access layer and domain models.

* Reusable Building Block: This GEM acts as a reusable base class for your specific repositories (e.g., UserRepository, AuthorRepository), allowing them to focus on constructing SQL queries and mapping data, rather than managing database connections.

## Purpose:
The primary goal of this GEM is to provide a robust, maintainable, and testable data access layer for Node.js applications that interact directly with a PostgreSQL database without relying on an ORM. It aims to reduce boilerplate code in individual repositories and enforce consistent database interaction patterns across your application.

## Index: 

Bellow you'll be able to find the path for the documentation files for each class or component.

1. **Introduction:**
2. **documentation/manyToManyModel.md:**
3. **documentation/schema.md:**
4. **documentation/singleEntityModel.md:**
5. **Introdocumentation/singleModelQueries.mdduction:**
