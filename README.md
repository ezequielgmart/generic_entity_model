# Generic Entity Model (GEM)
This repository contains a foundational **Generic Entity Model (GEM)** designed to streamline database interactions in **Node.js applications** using **PostgreSQL**. It serves as an agnostic set of tools for performing standard **CRUD (Create, Read, Update, Delete)** operations, abstracting away the direct **pg** client calls and connection management.

## Key Features:

* Database Agnostic Core: The GenericEntityModel is designed to be independent of specific database configuration files. It receives a getPoolFn (a function to retrieve the PostgreSQL connection pool) via its constructor, ensuring flexibility and testability.

* Centralized Query Execution: All database queries (insert, select, update, delete) are routed through internal helper methods (_queryWithParams, _singleQuery), which handle connecting to the database, executing the query, and releasing the client back to the pool.

* Basic Error Handling: Includes generic error handling for common database issues, such as unique constraint violations (23505), translating them into more readable application-level errors.

* Entity Mapping: Automatically maps database results to instances of your defined Entity Models (e.g., User, Author, Book), promoting a clean separation between your data access layer and domain models.

* Reusable Building Block: This GEM acts as a reusable base class for your specific repositories (e.g., UserRepository, AuthorRepository), allowing them to focus on constructing SQL queries and mapping data, rather than managing database connections.

## Purpose:
The primary goal of this GEM is to provide a robust, maintainable, and testable data access layer for Node.js applications that interact directly with a PostgreSQL database without relying on an ORM. It aims to reduce boilerplate code in individual repositories and enforce consistent database interaction patterns across your application.

## Getting Started

1. **Install the NPM package**
     ```
       npm install generic-entity-models
    ```
2. **Config the db pool**
   *(create the db.js on: src/config/db.js)*
      ```
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

    ```
3. **Implementations & files**
    *(this an example of a repository using an author as example)*
    ```
       
       import AuthorEntity from "./entity"; // importing from src/features/author/entity.js
      
      /**
       * @class AuthorRepository
       * @description Author domain CRUD methods
       */
      
      /** 
       * Methods
       * @method insert
       * @method getAll
       * @method getById
       * @method update
       * @method delete
       * 
       */
      
      class AuthorRepository { 
   
       /**
        * @method insert
        * @description Author create new
        */
       static async insert(objectByparam){
           const {author_id, first_name, last_name, nationality } = objectByparam
           const queryValues = [author_id, first_name, last_name, nationality]
   
           const result = await AuthorEntity.insert(queryValues);
           
           return result;
   
       }
   
       /**
        * 
        * @method getAll
        * @description Author get all the authors 
        */
       static async getAll(){
           
           const result = await AuthorEntity.select();
           
           return result;
       }
   
       /**
        * 
        * @method getById
        * @description get a author by id
        */
   
       /*selectbyMkId */
       static async getById(authorId){
           
           const queryParams = [authorId]
           
           const result = await AuthorEntity.selectbyMkId(queryParams);
           
           return result;
           
       }
      
       /**
        * 
        * @method update
        * @description update Author information on file
        */
       static async update(entity){
         
           // generate the sql query string based on the model
           // const queryText = AuthorRepository.model.updateQuery();
   
           const { author_id, first_name, last_name, nationality } = entity;  
           const queryParams = [author_id, first_name, last_name, nationality]
           const result = await AuthorEntity.update(queryParams);
           
           return result;
           
       }
   
       /**
        * 
        * @method delete
        * @description delete Author
        */
       static async delete(authorId){
           
           // generate the sql query string based on the model
           const queryText = AuthorRepository.model.deleteQuery();
   
           const queryParams = [authorId]
           
           const result = await Gem.delete(queryText, queryParams, Author);
           
           return result;
   
       }
   
   }

      export default AuthorRepository;
    
    ```
   

## Single Entity 
Entities for a single table or domain, for example book. 

### Single Entity Methods

* **selectQuery:** return a SELECT SQL typical query. 
* **selectByFieldQuery:** return a SELECT SQL query using WHERE and a key passed by param. 
* **insertQuery:** return a INSERT SQL query. 
* **updateQuery:** return a update SQL query. 
* **deleteQuery:** return a delete SQL query. 


## ManyToMany Entity 
Entities for a single table or domain, for example book. 


### Single Entity Methods

* **select_join_query_by_entity_id:** return a SELECT JOIN SQL using a key_with_alias. Example: If you have a manyToMany model like Book_authors where you store the book / authors you can pass the book.book_id as the key_with_alias if you want to receive the authors for an specific book, otherwise if you'd like to receive the books that belongs for a particular author you can pass the author.author_id as the key_with_alias.


### Example

* On this directory you guys will be able to find an implementation using the "author" as example. Here you'll be able to see how the db.js config file should like, also the repository file and the entity. 
