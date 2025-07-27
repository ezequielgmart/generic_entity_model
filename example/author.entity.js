import getPool from "./db";
import { SingleEntityModel } from "../gem";

// SingleEntityModel example of creating a gem instance for a single relation entity or a table that isn't a many to many 

configData = {
    table:"authors",
    alias:"author",
    fields:[{
                name:"author_id",
                field_type:"varchar",
                main_key:true
            },
            {
                name:"first_name",
                field_type:"varchar",
                main_key:false
            },
            {
                name:"last_name",
                field_type:"varchar",
                main_key:false
            },
            {
                name:"nationality",
                field_type:"varchar",
                main_key:false
            }]

}

const AuthorEntity = new SingleEntityModel(getPool, configData)

export default AuthorEntity;