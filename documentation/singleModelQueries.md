# `SingleModelQueries` Class

---

The `SingleModelQueries` class **extends the `Schema` class** and is designed to generate SQL query strings for basic **single-table operations** (CRUD: Create, Read, Update, Delete). Its primary purpose is to abstract the construction of repetitive SQL queries, making database interaction cleaner and less error-prone.

## Purpose

`SingleModelQueries` focuses on **SQL query generation** for:

* Selecting all records from a table.
* Selecting records based on a specific field.
* Inserting new records into a table.
* Updating existing records.
* Deleting records from a table.

By inheriting from `Schema`, this class has access to the table's definition (name, alias, fields) and utility methods for formatting field names and query parameters.

## Usage (Extension)

Like `Schema`, `SingleModelQueries` is a base class. Other classes (such as `SingleEntityModel`) are expected to extend it and use its methods to build the queries that will then be executed against the database.

The constructor of `SingleModelQueries` simply calls `super()`, meaning that the initialization of `this.schema` must be handled by the class extending `SingleModelQueries` (or by a higher class in the inheritance chain).

---

## `SingleModelQueries` Class Methods

All methods in this class return string representations of complete SQL queries.

### `constructor()`

* **Description**: The constructor for the `SingleModelQueries` class. It calls the `Schema` class constructor (`super()`). The schema definition (`this.schema`) must be provided by the class extending `SingleModelQueries`.

### `selectQuery()`

* **Description**: Generates an SQL query to select **all fields from all records** of the table associated with the schema.
* **Returns**: `string` - An SQL query string like `SELECT field1, field2 FROM table_name`.

### `selectByFieldQuery(key)`

* **Description**: Generates an SQL query to select **all fields from records that match a given value in a specific field**. The query uses a `$1` placeholder for the field's value.
* **Parameters**:
    * `key` (`string`): The name of the field to filter by (e.g., `'user_id'`).
* **Returns**: `string` - An SQL query string like `SELECT field1, field2 FROM table_name WHERE key_field=$1`.

### `insertQuery()`

* **Description**: Generates an SQL query to **insert a new record** into the table. It includes the `RETURNING` clause to return all fields of the newly inserted record. The values to be inserted are represented by placeholders (`$1, $2, ...`).
* **Returns**: `string` - An SQL query string like `INSERT INTO table_name (field1, field2) VALUES ($1, $2) RETURNING field1, field2`.

### `updateQuery()`

* **Description**: Generates an SQL query to **update an existing record** in the table. The update is performed based on the table's primary key (which is expected to be the first parameter `$1`). Fields to be updated are represented by subsequent placeholders (`$2, $3, ...`). It includes the `RETURNING` clause to return the updated record.
* **Returns**: `string` - An SQL query string like `UPDATE table_name SET field1 = $2, field2 = $3 WHERE primary_key = $1 RETURNING field1, field2`.
* **Note**: This method assumes that `this.schema.fields[0].name` is the primary key. If your `Schema` does not guarantee this, the method might generate incorrect queries.

### `deleteQuery()`

* **Description**: Generates an SQL query to **delete a record** from the table. The deletion is performed based on the table's primary key, using a `$1` placeholder for the key's value.
* **Returns**: `string` - An SQL query string like `DELETE FROM table_name WHERE primary_key = $1`.
* **Note**: Similar to `updateQuery()`, this method assumes that `this.schema.fields[0].name` is the primary key.

---

## Conceptual Usage Example

```javascript
// Assuming you have a UserModel class that extends SingleModelQueries
// and has initialized this.schema in its constructor.

// class UserModel extends SingleModelQueries {
//   constructor() {
//     super({
//       table: 'users',
//       alias: 'usr',
//       fields: [
//         { name: 'user_id', main_key: true },
//         { name: 'username' },
//         { name: 'email' }
//       ]
//     });
//   }
// }

// const userModel = new UserModel();

// console.log(userModel.selectQuery());
// // Output: "SELECT user_id, username, email FROM users"

// console.log(userModel.selectByFieldQuery('username'));
// // Output: "SELECT user_id, username, email FROM users WHERE username=$1"

// console.log(userModel.insertQuery());
// // Output: "INSERT INTO users (user_id, username, email) VALUES ($1, $2, $3) RETURNING user_id, username, email"

// console.log(userModel.updateQuery());
// // Output: "UPDATE users SET username = $2, email = $3 WHERE user_id = $1 RETURNING user_id, username, email"

// console.log(userModel.deleteQuery());
// // Output: "DELETE FROM users WHERE user_id = $1"