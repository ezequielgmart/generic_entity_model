
class Schema {   
    constructor(){
        
    }
    get_main_key(){
        return this.schema.fields[0].name
    }

    
    get_alias(){
        return this.schema.alias
    }


    get_all_fields_toString(){
        return this.fields_toString(this.get_all_fields())
    }

    
    get_all_fields_with_alias_toString(){
        return this.fields_toString(this.get_all_fields_with_alias())
    }

    get_all_fields(){

        let tableFields = [];

        this.schema.fields.forEach(field => {
              tableFields.push(`${field.name}`)  
        });
        
        return tableFields
    }

   
    get_all_fields_with_alias(){

        let tableFields = [];

        this.schema.fields.forEach(field => {
              tableFields.push(`${this.schema.alias}.${field.name}`)  
        });
        
        return tableFields;
    }

    fields_toString(fields){

        return fields.join(', ');

    }

    get_queryParams_for_insert_toString(){
        let queryToString = this.fields_toString(this.get_queryParams_for_insert())
        return queryToString
    }

    get_queryParams_for_update_toString(){
        let queryToString = this.fields_toString(this.get_queryParams_for_update())
        return queryToString
    }
    // this creates the VALUES ($1,$2) on the insert query 
    get_queryParams_for_insert(){
        
        let queryParamsQty = []
        let paramIndex = 1;
        // Loop through each field definition
        this.schema.fields.forEach(field => {
            // For all other fields, add them to our fieldsToSet array
            // in the format "column_name = $paramIndex"
            queryParamsQty.push(`$${paramIndex}`);
            paramIndex += 1; // Increment the parameter index for the next field
        });

        return queryParamsQty;
        
        
    }

    get_queryParams_for_update(){
        
        let fieldsToSet = []; // Renamed for clarity: these are the fields for the SET clause
        let paramIndex = 2;     // Parameters for the SET clause start from $2

        // Loop through each field definition
        this.schema.fields.forEach(field => {
            // We want to exclude the primary key from the SET clause,
            // as it's typically used in the WHERE clause.
            if (field.main_key) {
                // If it's the primary key, skip it for the SET clause.
                return; // Skips to the next iteration in the forEach loop
            }

            // For all other fields, add them to our fieldsToSet array
            // in the format "column_name = $paramIndex"
            fieldsToSet.push(`${field.name} = $${paramIndex}`);
            paramIndex += 1; // Increment the parameter index for the next field
        });

        
        return fieldsToSet;
    }

    get_field_with_alias(field){
        return (`${this.schema.alias}.${field}`)
    }

    
    get_mk_with_alias(){
        return (`${this.schema.alias}.${this.get_main_key()}`)
    }
    
    get_table(){
        return this.schema.table;
    }}

    /** 7/21 TODO: update the doc and commets here among with the other files */
/**
 * @class GenericEntityModel
 * @description Provides generic SQL query execution methods for various database operations.
 * It handles database connection pooling and basic error handling.
 */



// This class is reserved for the one table queries
class SingleModelQueries extends Schema{ 

    constructor(){
        super()
    }
    
    selectQuery(){
        
        // this create
        const allFieldstoString = this.get_all_fields_toString()

        return `SELECT ${allFieldstoString} FROM ${this.schema.table}`
    }

    /* selectByQuery */
    selectByFieldQuery(key){
        
        const allFieldstoString = this.get_all_fields_toString()
        return `SELECT ${allFieldstoString} FROM ${this.schema.table} WHERE ${key}=$1`
    }
    /* insertQuery */
    insertQuery(){
        
        const queryParamsQtyToString = this.get_queryParams_for_insert_toString()
        const fieldsString = this.get_all_fields_toString()
        return `INSERT INTO ${this.schema.table} (${fieldsString}) VALUES (${queryParamsQtyToString}) RETURNING ${fieldsString}`
    }
    /* updateQuery */
    updateQuery(){

        const allFieldstoString = this.get_all_fields_toString()
        const fieldsString = this.get_queryParams_for_update_toString()
        
        return `UPDATE ${this.schema.table} SET ${fieldsString} WHERE ${this.schema.fields[0].name} = $1 RETURNING ${allFieldstoString}`
        // return `SELECT ${fieldsString} FROM `

    }
    /* deleteQuery */
    deleteQuery(){
        
        return `DELETE FROM ${this.schema.table} WHERE ${ this.schema.fields[0].name} = $1`
    }
  
}


export class SingleEntityModel extends SingleModelQueries{
    /**
     * Constructor for GenericEntityModel.
     * @param {Function} getPoolFn - A function that returns the PostgreSQL connection pool instance. Expected to be located on config/db.js in your project
     * @param {Object} configData - with the requiered configuration from the <entities/entityfile.js>
     */
    constructor(getPoolFn, table, alias, fields) {
        super()
        // Store the function to get the pool, rather than the pool instance itself.
        // This defers the actual pool retrieval until a query method is called.
        this._getPoolFn = getPoolFn;

        // here we must to define the 
        this.schema = {
            table:table,
            alias:alias,
            fields:[]
        }
        
        // the fields of the this.schema.fields will be based on the number of elemnts on configData.fields.  
        fields.forEach(field => {
            this.schema.fields.push(field)
        });

    }

    /**
     * Executes an INSERT query and returns a new Entity instance from the result.
     * @param {string} queryText - The SQL INSERT query string.
     * @param {Array} queryParams - An array of parameters for the query.
     * @param {Class} Entity - The constructor for the Entity model (e.g., User, Author, Book).
     * @returns {Promise<Object>} A promise that resolves to a new instance of the Entity.
     * @throws {Error} On database error, including unique constraint violations.
     */
    async insert(queryParams) {
        const queryText = this.insertQuery()
        const result = await this._queryWithParams(queryText, queryParams);
        // Assuming result.rows[0] contains the data for the newly inserted entity
        return { ...result.rows[0] };
    }

    /**
     * Executes a SELECT query to retrieve all records and maps them to Entity instances.
     * @param {string} queryText - The SQL SELECT query string.
     * @param {Class} Entity - The constructor for the Entity model.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of Entity instances.
     * @throws {Error} On database error.
     */
    async select() {

        const queryText = this.selectQuery()
        const result = await this._singleQuery(queryText);
        return result.rows.map(row => row);
    }

    /* 7/21/25 TO DO: comment the design decision behind this method */
    async selectbyMkId(queryParams) {

        // mk stands for MainKey Id and will be used as the querytext here. 
        const mkId = this.get_main_key()
        const queryText = this.selectByFieldQuery(mkId)
        // query param here should be the value of the main key Id
        const result = await this._queryWithParams(queryText, queryParams);
        return result.rows[0] ? result.rows[0] : null;

    }

    /**
     * Executes a SELECT query with parameters to retrieve a single record by a specific field.
     * @param {string} queryText - The SQL SELECT query string with parameters.
     * @param {Array} queryParams - An array of parameters for the query.
     * @param {Class} Entity - The constructor for the Entity model.
     * @returns {Promise<Object|null>} A promise that resolves to a single Entity instance if found, otherwise null.
     * @throws {Error} On database error.
     */
    async selectWithParams(queryText, queryParams) {
        const result = await this._queryWithParams(queryText, queryParams);
        return result.rows[0] ? result.rows[0] : null;
    }

    /**
     * Executes an UPDATE query and returns the updated Entity instance.
     * @param {string} queryText - The SQL UPDATE query string.
     * @param {Array} queryParams - An array of parameters for the query.
     * @param {Class} Entity - The constructor for the Entity model.
     * @returns {Promise<Object|null>} A promise that resolves to the updated Entity instance if found, otherwise null.
     * @throws {Error} On database error.
     */
    async update(queryParams) {
        const queryText = this.updateQuery()
        const result = await this._queryWithParams(queryText, queryParams);
        return result.rows[0] ? result.rows[0] : null;
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

export class ManyToManyEntityModel extends Schema{ 

    constructor(){
        super()
    }

    /*    
    ===================================
    READ ME! 
    ===================================
    return a SELECT JOIN SQL using a key_with_alias. Example: If you have a manyToMany model like Book_authors where you store the book / authors you can pass the book.book_id as the key_with_alias if you want to receive the authors for an specific book, otherwise if you'd like to receive the books that belongs for a particular author you can pass the author.author_id as the key_with_alias.  

      /* example of the query that I'm looking for
            SELECT author.author_id, author.first_name, author.last_name, author.nationality,
                book.book_id,
                book.title,
                book.release_date
            FROM
                authors AS author 
            JOIN
                book_authors AS book_author ON author.author_id = book_author.author_id
            JOIN
                books AS book ON book_author.book_id = book_author.book_id
            WHERE
                {key_with_alias} (book.book_id / author.author_id) = $1;

    */
    select_join_query_by_entity_id(key_with_alias){
        // fk_model_1 is BookModel, fk_model_2 is AuthorModel
        // We want to select authors and books, filtered by author ID.

        const fkModel1AllFieldsToString = this.fk_model_1.get_all_fields_with_alias_toString(); // Fields from Book (e.g., book.book_id, book.title)
        const fkModel2AllFieldsToString = this.fk_model_2.get_all_fields_with_alias_toString(); // Fields from Author (e.g., author.author_id, author.first_name)

        const fk_model_1_table = this.fk_model_1.get_table(); // "books"
        const fk_model_1_alias = this.fk_model_1.get_alias(); // "book"
        
        // This variable is not directly used in the final query string, but its concept is used in the JOIN condition.
        // const fk_model_1_key_with_alias = this.fk_model_1.get_field_with_alias("book_id");

        const fk_model_2_table = this.fk_model_2.get_table(); // "authors"
        const fk_model_2_alias = this.fk_model_2.get_alias(); // "author"
        
        const many_to_many_table = this.get_table(); // "book_authors"
        const many_to_many_alias = this.get_alias(); // "book_author"

        // The main key of the junction table that links to fk_model_1 (Book)
        const junction_fk_to_model1 = this.schema.fields[0].name; // "book_id" from book_authors
        // The main key of the junction table that links to fk_model_2 (Author)
        const junction_fk_to_model2 = this.schema.fields[1].name; // "author_id" from book_authors

        const queryString = `SELECT ${fkModel2AllFieldsToString}, ${fkModel1AllFieldsToString} ` +
                            `FROM ${fk_model_2_table} AS ${fk_model_2_alias} ` +
                            `JOIN ${many_to_many_table} AS ${many_to_many_alias} ` +
                            `ON ${fk_model_2_alias}.${this.fk_model_2.get_main_key()} = ${many_to_many_alias}.${junction_fk_to_model2} ` + // JOIN authors to book_authors on author_id
                            `JOIN ${fk_model_1_table} AS ${fk_model_1_alias} ` +
                            `ON ${many_to_many_alias}.${junction_fk_to_model1} = ${fk_model_1_alias}.${this.fk_model_1.get_main_key()} ` + // JOIN book_authors to books on book_id
                            `WHERE ${key_with_alias} = $1;`; // Filter by author.author_id

        return queryString;
    }

    /* insertQuery */
    insertQuery(){
        
        const queryParamsQtyToString = this.get_queryParams_for_insert_toString()
        const fieldsString = this.get_all_fields_toString()
        const queryString = `INSERT INTO ${this.get_table()} ` + 
                            `(${fieldsString}) ` +
                            `VALUES (${queryParamsQtyToString}) ` +
                            `RETURNING ${fieldsString}`

        return queryString;
    }

    /* updateQuery */
    updateQuery(){

        const allFieldstoString = this.get_all_fields_toString()
        const fieldsString = this.get_queryParams_for_update_toString()
        
        const queryString = `UPDATE ${this.get_table()} `+
                            `SET ${fieldsString} `+ 
                            `WHERE ${this.get_main_key()} = $1 `+
                            `RETURNING ${allFieldstoString} `
        
         return queryString;

    }
    /* deleteQuery */
    deleteQuery(){

        const fk_model_1_mk = this.fk_model_1.get_main_key()
        const fk_model_2_mk = this.fk_model_2.get_main_key()
        
        const queryString = `DELETE FROM ${this.get_table()} `+
                            `WHERE ${fk_model_2_mk} = $1`+
                            `AND ${fk_model_1_mk} = $2;`
        return queryString
    }

}