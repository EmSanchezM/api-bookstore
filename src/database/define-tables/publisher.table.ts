import Surreal from "surrealdb";

export const definePublisher = async(db: Surreal) => {
  const tableExists = await db.query('INFO FOR TABLE publisher') as Array<any>;

  if(Array.isArray(tableExists) && tableExists.length > 0) return;

  await db.query(`
    DEFINE TABLE publisher SCHEMAFULL
    PERMISSIONS
      FOR select FULL,
      FOR create FULL,
      FOR update FULL,
      FOR delete FULL;

    DEFINE FIELD name ON publisher TYPE string;
    DEFINE FIELD website ON publisher TYPE string;
  `);
};