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
    * [https://github.com/ezequielgmart/generic_entity_model ]*

2. **Use the instance on your repositories files**
    *(Create a gem.js file on your src/config with the following information)*
    ```
    /* here we'll have our instance of gem * */

        import GenericEntityModel from "../../gem/index.js"
        import getPool from "./db"

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