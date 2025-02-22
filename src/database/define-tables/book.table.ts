import Surreal from "surrealdb";

export const defineBook = async(db: Surreal) => {
  const tableExists = await db.query('INFO FOR TABLE book') as Array<any>;

  if(Array.isArray(tableExists) && tableExists.length > 0) return;

  await db.query(`
    DEFINE TABLE book SCHEMAFULL
    PERMISSIONS
      FOR select FULL,
      FOR create FULL,
      FOR update FULL,
      FOR delete FULL;

    DEFINE FIELD title ON book TYPE string;
    DEFINE FIELD isbn ON book TYPE string;
    DEFINE FIELD publication_date ON book TYPE datetime;
    DEFINE FIELD publisher ON book TYPE record<publisher>;
  `);
};