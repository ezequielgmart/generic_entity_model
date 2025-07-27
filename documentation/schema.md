# `Schema` Class

---

The `Schema` class serves as the **fundamental base** for defining database table structures and facilitating the dynamic generation of SQL query parts. It's designed to be extended by other model classes, such as `SingleModelQueries` or `ManyToManyEntityModel`, which will then initialize the schema definition for a specific table.

---

## Purpose

The main goal of the `Schema` class is to provide a standardized and reusable interface to:

* **Describe a table's composition**: This includes its name, an alias for use in queries, and a detailed list of its fields.
* **Generate SQL query fragments**: It offers methods to get field names (with or without aliases), parameters for `INSERT` and `UPDATE` statements, and the name of the primary key.

---

## Usage (Extension)

The `Schema` class isn't meant to be instantiated directly. Instead, other classes should extend it and take responsibility for initializing the `this.schema` property within their own constructors.

### `this.schema` Structure

When you extend the `Schema` class, you should define the `this.schema` property with the following structure:

```javascript
this.schema = {
    table: 'table_name',     // The actual name of the table in the database
    alias: 'table_alias',    // A short alias to use for the table in SQL queries (e.g., 'usr' for 'users')
    fields: [                // An array of objects, each describing a field
        { name: 'id', main_key: true }, // An example field, 'main_key: true' for the primary key
        { name: 'column_name_2' },
        { name: 'column_name_3' }
        // ... more fields
    ]
};