import Surreal from "surrealdb";

export const defineLanguage = async(db: Surreal) => {
  const tableExists = await db.query('INFO FOR TABLE language') as Array<any>;

  if(Array.isArray(tableExists) && tableExists.length > 0) return;

  await db.query(`
    DEFINE TABLE language SCHEMAFULL
    PERMISSIONS
      FOR select FULL,
      FOR create FULL,
      FOR update FULL,
      FOR delete FULL;

    DEFINE FIELD name ON language TYPE string;
    DEFINE FIELD iso_code ON language TYPE string;
  `);
};