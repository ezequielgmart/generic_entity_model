// src/gem/Gem.js


/**
 * @class GenericEntityModel
 * @description Provides generic SQL query execution methods for various database operations.
 * It handles database connection pooling and basic error handling.
 */
export default class GenericEntityModel {
    /**
     * Constructor for GenericEntityModel.
     * @param {Function} getPoolFn - A function that returns the PostgreSQL connection pool instance.
     * This allows the model to be agnostic of the specific database configuration file.
     */
    constructor(getPoolFn) {
        // Store the function to get the pool, rather than the pool instance itself.
        // This defers the actual pool retrieval until a query method is called.
        this._getPoolFn = getPoolFn;
    }

    /**
     * Executes an INSERT query and returns a new Entity instance from the result.
     * @param {string} queryText - The SQL INSERT query string.
     * @param {Array} queryParams - An array of parameters for the query.
     * @param {Class} Entity - The constructor for the Entity model (e.g., User, Author, Book).
     * @returns {Promise<Object>} A promise that resolves to a new instance of the Entity.
     * @throws {Error} On database error, including unique constraint violations.
     */
    async insert(queryText, queryParams, Entity) {
        const result = await this._queryWithParams(queryText, queryParams);
        // Assuming result.rows[0] contains the data for the newly inserted entity
        return new Entity({ ...result.rows[0] });
    }

    /**
     * Executes a SELECT query to retrieve all records and maps them to Entity instances.
     * @param {string} queryText - The SQL SELECT query string.
     * @param {Class} Entity - The constructor for the Entity model.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of Entity instances.
     * @throws {Error} On database error.
     */
    async select(queryText, Entity) {
        const result = await this._singleQuery(queryText);
        return result.rows.map(row => new Entity(row));
    }

    /**
     * Executes a SELECT query with parameters to retrieve a single record by a specific field.
     * @param {string} queryText - The SQL SELECT query string with parameters.
     * @param {Array} queryParams - An array of parameters for the query.
     * @param {Class} Entity - The constructor for the Entity model.
     * @returns {Promise<Object|null>} A promise that resolves to a single Entity instance if found, otherwise null.
     * @throws {Error} On database error.
     */
    async selectWithParams(queryText, queryParams, Entity) {
        const result = await this._queryWithParams(queryText, queryParams);
        return result.rows[0] ? new Entity(result.rows[0]) : null;
    }

    /**
     * Executes an UPDATE query and returns the updated Entity instance.
     * @param {string} queryText - The SQL UPDATE query string.
     * @param {Array} queryParams - An array of parameters for the query.
     * @param {Class} Entity - The constructor for the Entity model.
     * @returns {Promise<Object|null>} A promise that resolves to the updated Entity instance if found, otherwise null.
     * @throws {Error} On database error.
     */
    async update(queryText, queryParams, Entity) {
        const result = await this._queryWithParams(queryText, queryParams);
        return result.rows[0] ? new Entity(result.rows[0]) : null;
    }

    /**
     * Executes a DELETE query.
     * @param {string} queryText - The SQL DELETE query string.
     * @param {Array} queryParams - An array of parameters for the query.
     * @returns {Promise<number>} A promise that resolves to the number of rows affected (0 or 1).
     * @throws {Error} On database error.
     */
    async delete(queryText, queryParams) {
        const result = await this._queryWithParams(queryText, queryParams);
        return result.rowCount;
    }

    /**
     * Internal helper method to connect to the database, execute a parameterized query, and release the client.
     * Handles specific unique constraint errors.
     * @param {string} queryText - The SQL query string.
     * @param {Array} queryParams - An array of parameters for the query.
     * @returns {Promise<pg.QueryResult>} The result object from the pg client.
     * @throws {Error} Re-throws any database errors, translating unique constraint errors.
     * @private
     */
    async _queryWithParams(queryText, queryParams) {
        let dbClient;
        try {
            // Get the pool instance using the function passed in the constructor
            const poolInstance = this._getPoolFn(); 
            dbClient = await poolInstance.connect();
            const result = await dbClient.query(queryText, queryParams);
            return result;
        } catch (error) {
            // Specific error handling for unique constraint violations
            if (error.code === '23505') {
                throw new Error('ID already exists.'); // Generic message for unique ID conflict
            }
            console.error('Error executing parameterized query:', error);
            throw error; // Re-throw other database errors
        } finally {
            if (dbClient) {
                dbClient.release(); // Always release the client back to the pool
            }
        }
    }

    /**
     * Internal helper method to connect to the database, execute a simple query, and release the client.
     * @param {string} queryText - The SQL query string.
     * @returns {Promise<pg.QueryResult>} The result object from the pg client.
     * @throws {Error} Re-throws any database errors.
     * @private
     */
    async _singleQuery(queryText) {
        let dbClient;
        try {
            // Get the pool instance using the function passed in the constructor
            const poolInstance = this._getPoolFn(); 
            dbClient = await poolInstance.connect();
            const result = await dbClient.query(queryText);
            return result;
        } catch (error) {
            console.error('Error executing single query:', error);
            throw error;
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    }
}