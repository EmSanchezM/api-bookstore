import Surreal from "surrealdb";

export const defineAuthor = async(db: Surreal) => {
  const tableExists = await db.query('INFO FOR TABLE author') as Array<any>;
  
  if(Array.isArray(tableExists) && tableExists.length > 0) return;

  await db.query(`
    DEFINE TABLE author SCHEMAFULL
    PERMISSIONS
      FOR select FULL,
      FOR create FULL,
      FOR update FULL,
      FOR delete FULL;

    DEFINE FIELD name ON author TYPE string;
    DEFINE FIELD last_name ON author TYPE string;
  `);
};