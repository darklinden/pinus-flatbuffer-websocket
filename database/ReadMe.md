# database management

* There are two types of ORM-based database management
  * Generating tables based on structure descriptions. After modifying the structure code, the modified SQL is automatically generated and synchronized to the database.
  * Generate code by reading the table structure from the database and the code changes as the database changes
  * Currently I want to use the second method

* It is currently envisioned to create a migration table in the database that records changes to each table. When the database changes, write the appropriate version of the table creation and merge scripts, with the current version of the database determining which script is executed.
