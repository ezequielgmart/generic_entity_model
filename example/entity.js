

import getPool from "./config/db.js";

// using my npm package
import { SingleEntityModel } from "..";

/*

    SingleEntityModel example of creating a gem instance 
    for a single relation entity or a table that isn't a many to many 

*/ 

    const table = "authors";
    const alias = "author";
    const fields = [{
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
            }];



const AuthorEntity = new SingleEntityModel(getPool, table, alias, fields)

export default AuthorEntity;