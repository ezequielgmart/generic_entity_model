export default class GemSchema {   
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