# `Example` Folder
This folder contains an example on how this generic-entity-models (GEM) should be implented on your projects.

## Breakdown: 

* **Config Folder:** Includes the `db.js` file where the pool was initiated and exported for use on the entities files. 
* **entity.js file:** imports `getPool` from `db.js` and we make a instance of `SingleEntityModel`, creating a gem instance 
    for a single relation entity or a table that isn't a many to many. For this example we are going be using "author" as the domain and table information, fields, alias, name, etc. Then exports the `AuthorEntity` 
* **repository.js file:** imports `AuthorEntity` from `entity.js` and we're going to be using this `AuthorEntity` for the repository functions and then export these functions towards the `services`. 




