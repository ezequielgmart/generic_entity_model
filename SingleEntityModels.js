import GemSchema from "./schema"

// This file is reserved for the queries
export default class GemSingleModel extends GemSchema{ 

    constructor(){
        super()
    }
    /* 
    * todo:  
    * *
    * * NOTE FOR THE FUTURE
    *  I SHOULD FIND A WAY TO GET ONLY 1 SOURCE OF Truth for DATA
    * I mean, find a way to merge models with entity
    */
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


        // return (`${this.schema.alias}.${field}`)