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

1. **Download the code in a .zip format**
    *[https://github.com/ezequielgmart/generic_entity_model ]*

2. **Use the instance on your repositories files**
    *(Create a gem.js file on your src/config/ with the following information)*
    ```
    /* here we'll have our instance of gem * */

        import GenericEntityModel from "../../gem/index.js"
        import getPool from "./db" // your db config file exporting the getPool function in order to receive the pg object

        class Instance extends GenericEntityModel{
            
            constructor(){
                super(getPool)
            }
            // static Gem = new GenericEntityModel()

        }

        // Create and export a single instance of the class
        const Gem = new Instance();

        export default Gem;
    ```
3. **Implementations & files**
    *(this an example of a repository using a book as example)*
    ```
    import Gem from "../../config/gem.js"; // the prior step 
    import Book from "../../entities/book.js"; 
    import BookModel from "./model.js";

    // Below you'll find an example how the entities/book.js and book/model.js should like

    /**
    * @class BookRepository
    * @description Book domain CRUD methods
    */
    class BookRepository { 
        /**
        * @method insert
        * @description Book domain CRUD methods
        */
        static model = new BookModel()
        
        static async insert(entity){

            const { book_id, title, release_date } = entity;
            
            // this should generate the SQL query
            const queryText = BookRepository.model.insertQuery()

            const queryParams = [book_id, title, release_date];

            const result = await Gem.insert(queryText, queryParams, Book);
            
            return result;

        }
        
        /**
        * @method getAll
        * @description Author domain CRUD methods
        */
        static async getAll(){

            const queryText = BookRepository.model.selectQuery()
            const result = await Gem.select(queryText, Book);
            
            return result;
            
    }
    ```
    *(this an example of a entity using a book as example)*
    ```
    export default class Book{ 
        /**
        * @param {Object} data - Object the book data.
        * @param {string} data.book_id - ID .
        * @param {string} data.title - book title.
        * @param {date} data.release_date - mm/dd/yyyy when was relased for the first time the book.
        */


        constructor({book_id, title, release_date}){
            
            if ( !book_id || !title || !release_date ){
                throw new Error("Book model requires book_id, title, release_date")
            }

            this.book_id = book_id
            this.title = title
            this.release_date = release_date
        }
    }
    ```
    *(this an example of a entity using a book as example)*
    ```
    import GemSingleModel from "../../../gem/SingleEntityModels.js";

    export default class BookModel extends GemSingleModel{ 

        constructor(){
            super()

            this.schema = {
                "table":"books",
                "alias":"book",
                "fields":[{
                    name:"book_id",
                    field_type:"varchar",
                    main_key:true
                },
                {
                    name:"title",
                    field_type:"varchar",
                    main_key:false
                },
                {
                    name:"release_date",
                    field_type:"varchar",
                    main_key:false
                }]}
            
        }

        static getModel(){
            return this();
        }
    }

    ```

## Single Entity 
* **description:** Entities for a single table or domain, for example book. 

### Single Entity Methods

* **selectQuery:** return a SELECT SQL typical query. 
* **selectByFieldQuery:** return a SELECT SQL query using WHERE and a key passed by param. 
* **insertQuery:** return a INSERT SQL query. 
* **updateQuery:** return a update SQL query. 
* **deleteQuery:** return a delete SQL query. 

    