
import { describe, it, expect, beforeEach, mock } from 'vitest';

// Import necessary modules for testing.
import AuthorRepository from '../../src/features/authors/repository.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import getPool from '../../src/config/db.js';

describe("Integration",()=>{
    
    // beforeEach hook to truncate the table before each individual test.
        beforeEach(async ()=>{
            let client; 
            try {
                // Get the globally initialized pool instance.
                const pool = getPool(); 
                client = await pool.connect();
                // Truncate the 'users' table to ensure a clean state for each test.
                await client.query("TRUNCATE TABLE authors RESTART IDENTITY CASCADE;");
                await client.query("TRUNCATE TABLE books RESTART IDENTITY CASCADE;");
                await client.query("TRUNCATE TABLE genres RESTART IDENTITY CASCADE;");
                await client.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
            } catch (error) {
                console.error("Error cleaning the db before the test: ", error);
                // Re-throw with a more descriptive message for clarity in test runner output
                throw new Error(`Error cleaning the db before the test: ${error.message}`); 
            } finally { 
                if (client){
                    client.release(); // Always release the client back to the pool
                }
            }
        });

        describe("Authors", ()=>{
            describe("Insert",()=>{
                it("Should insert an author successfuly",async ()=>{
                       
                    const author_id = crypto.randomUUID();
                    const first_name = "Juan";
                    const last_name = "Bosch";
                    const nationality = "Dominican"
                    
                    const createdAuthor = await AuthorRepository.insert(author_id, first_name, last_name, nationality);
                    
                    // Assertions on the returned author instance
                    expect(createdAuthor.author_id).toBe(author_id);
                    expect(createdAuthor.first_name).toBe(first_name);
                    expect(createdAuthor.last_name).toBe(last_name);
                    expect(createdAuthor.nationality).toBe(nationality);
                })
            })
        })

})