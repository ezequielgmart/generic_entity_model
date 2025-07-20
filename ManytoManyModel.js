import GemSchema from "./schema";

export default class GemManytoManyModel extends GemSchema{ 

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