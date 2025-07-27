## Introduction 
This project implements a database abstraction layer in JavaScript, designed to simplify interactions with a PostgreSQL database. It follows a Model-View-Controller (MVC) like pattern, where these classes represent the "Model" component responsible for data interaction.

## Core Architectural Principles

The architecture is built around the following principles:

* **Schema Definition:** A Schema class provides a structured way to define database tables, their fields, and aliases, enabling dynamic query generation.

* **Query Generation:** The Schema and its subclasses dynamically construct SQL queries based on the defined schema, reducing boilerplate and potential for SQL injection.

* **Separation of Concerns:** Different types of database interactions (single-table vs. many-to-many relationships) are handled by specialized classes, promoting modularity.

* **Database Agnosticism (Limited):** While specifically implemented for PostgreSQL (indicated by pg.QueryResult and $1 parameter syntax), the design aims for a degree of database abstraction by generating generic SQL.

* **Connection Pooling:** It leverages a connection pool (via _getPoolFn) for efficient management of database connections.