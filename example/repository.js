import AuthorEntity from "./entity";

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
    static async insert(entity){
        const {author_id, first_name, last_name, nationality } = entity
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