import Surreal from "surrealdb";

export const defineCustomer = async(db: Surreal) => {
  const tableExists = await db.query('INFO FOR TABLE customer') as Array<any>;

  if(Array.isArray(tableExists) && tableExists.length > 0) return;

  await db.query(`
    DEFINE TABLE customer SCHEMAFULL
    PERMISSIONS
      FOR select FULL,
      FOR create FULL,
      FOR update FULL,
      FOR delete FULL;

    DEFINE FIELD first_name ON customer TYPE string;
    DEFINE FIELD last_name ON customer TYPE string;
    DEFINE FIELD email ON customer TYPE string;
  `);
}