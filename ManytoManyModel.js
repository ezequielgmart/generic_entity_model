import GemSchema from "./schema";

export default class GemManytoManyModel extends GemSchema{ 

    constructor(){
        super()
    }

    /* this  function was made for testing purposes only 
    
    ===================================
    READ ME! 
    ===================================
    Problem / Situation: Sometimes you need to get the information from one domain (authors) and the information (books) on other table which belongs to the first domain (authors). On other words, you need to get the book's information for a particular author. 

    This Solution's approach: You'll need a main domain (books), a secondary (authors), and the many-to-many domain itself (book_authors). 
    
    Why the books domain is the main one on this case? 
    

    
           
        If this query is used should return something like this: 

        SELECT author.author_id, author.first_name, author.last_name, author.nationality, book.book_id, book.title, book.release_date FROM authors AS author     JOIN book_authors AS book_author ON author.author_id = book_author.author_id JOIN books AS book ON book_author.book_id = book_author.book_id WHERE author.author_id = $1

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
                book.book_id = $1;

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
        
        const fk_model_1_mk_with_alias = this.fk_model_1.get_mk_with_alias(); // "author.author_id"
        // const fk_model_2_mk_with_alias = this.fk_model_2.get_mk_with_alias(); // "book.book_id"

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


}