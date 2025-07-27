# `ManyToManyEntityModel` Class

---

The `ManyToManyEntityModel` class **extends the `Schema` class** and is specifically designed to handle **many-to-many relationships** in a database. It provides methods for generating complex SQL `JOIN` queries and managing the junction (or "through") table that links two other entities.

## Purpose

`ManyToManyEntityModel` aims to simplify interactions with many-to-many relationships by:

* **Defining the junction table's schema**: It manages the structure of the intermediate table that connects two related entities.
* **Generating JOIN queries**: It constructs advanced SQL `SELECT` statements that join the two primary entity tables through the junction table, allowing you to retrieve combined data.
* **Facilitating junction table CRUD**: It provides methods for inserting, updating, and deleting records within the junction table itself.

By extending `Schema`, this class inherits the basic schema definition capabilities and utility methods for field and alias management.

## Usage

To use `ManyToManyEntityModel`, you need to instantiate it with the schema details of the **junction table** itself, as well as instances of the `SingleEntityModel` (or similar) for the **two related entities** it connects.

```javascript
import { ManyToManyEntityModel, SingleEntityModel, getPool } from './path/to/db';

// --- 1. Define Schemas for the individual entities (e.g., Book and Author) ---
const bookFields = [
    { name: 'book_id', main_key: true },
    { name: 'title' },
    { name: 'release_date' }
];
const authorFields = [
    { name: 'author_id', main_key: true },
    { name: 'first_name' },
    { name: 'last_name' },
    { name: 'nationality' }
];

// --- 2. Create SingleEntityModel instances for the individual entities ---
const BookModel = new SingleEntityModel(getPool, 'books', 'book', bookFields);
const AuthorModel = new SingleEntityModel(getPool, 'authors', 'author', authorFields);

// --- 3. Define Schema for the junction table (e.g., book_authors) ---
// The fields here are typically the foreign keys that form the composite primary key
const bookAuthorJunctionFields = [
    { name: 'author_id', main_key: true }, // Often, the first FK is considered part of the composite PK
    { name: 'book_id', main_key: true }    // The second FK, also part of the composite PK
];

// --- 4. Instantiate ManyToManyEntityModel ---
const BookAuthorJunctionModel = new ManyToManyEntityModel(
    'book_authors',        // Name of the junction table
    'book_author',         // Alias for the junction table
    bookAuthorJunctionFields, // Fields of the junction table (foreign keys)
    BookModel,             // The first related entity model
    AuthorModel            // The second related entity model
);

// Now you can use BookAuthorJunctionModel to query relationships:
// Example: Get all authors for a specific book_id
// const authorsForBook = await BookAuthorJunctionModel._queryWithParams(
//     BookAuthorJunctionModel.select_join_query_by_entity_id('book.book_id'),
//     ['your_book_id_here']
// );

// Example: Create an association (insert into junction table)
// await BookAuthorJunctionModel._queryWithParams(
//     BookAuthorJunctionModel.insertQuery(),
//     ['author_uuid_1', 'book_uuid_A']
// );