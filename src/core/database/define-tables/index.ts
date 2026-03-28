import type { Surreal } from 'surrealdb';

export const defineTables = async (db: Surreal) => {
  try {
    await db.query(`
        DEFINE TABLE IF NOT EXISTS country SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS name ON country TYPE string;
        DEFINE FIELD IF NOT EXISTS iso_code ON country TYPE string;
        DEFINE FIELD IF NOT EXISTS is_active ON country TYPE bool DEFAULT true;
        DEFINE FIELD IF NOT EXISTS created_at ON country TYPE datetime DEFAULT time::now();
        DEFINE FIELD IF NOT EXISTS updated_at ON country TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS publisher SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS name ON publisher TYPE string;
        DEFINE FIELD IF NOT EXISTS website ON publisher TYPE string;
        DEFINE FIELD IF NOT EXISTS is_active ON publisher TYPE bool DEFAULT true;
        DEFINE FIELD IF NOT EXISTS created_at ON publisher TYPE datetime DEFAULT time::now();
        DEFINE FIELD IF NOT EXISTS updated_at ON publisher TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS author SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS first_name ON author TYPE string;
        DEFINE FIELD IF NOT EXISTS last_name ON author TYPE string;
        DEFINE FIELD IF NOT EXISTS nationality ON author TYPE string;
        DEFINE FIELD IF NOT EXISTS biography ON author TYPE option<string>;
        DEFINE FIELD IF NOT EXISTS awards ON author TYPE option<array<string>>;
        DEFINE FIELD IF NOT EXISTS genres ON author TYPE option<array<string>>;
        DEFINE FIELD IF NOT EXISTS notable_works ON author TYPE option<array<string>>;
        DEFINE FIELD IF NOT EXISTS website ON author TYPE option<string>;
        DEFINE FIELD IF NOT EXISTS social_links ON author TYPE option<object>;
        DEFINE FIELD IF NOT EXISTS social_links.facebook ON social_links TYPE option<string>;
        DEFINE FIELD IF NOT EXISTS social_links.twitter ON social_links TYPE option<string>;
        DEFINE FIELD IF NOT EXISTS social_links.instagram ON social_links TYPE option<string>;
        DEFINE FIELD IF NOT EXISTS birth_date ON author TYPE datetime;
        DEFINE FIELD IF NOT EXISTS date_of_death ON author TYPE option<datetime>;
        DEFINE FIELD IF NOT EXISTS is_active ON author TYPE bool DEFAULT true;
        DEFINE FIELD IF NOT EXISTS created_at ON author TYPE datetime DEFAULT time::now();
        DEFINE FIELD IF NOT EXISTS updated_at ON author TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS language SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS name ON language TYPE string;
        DEFINE FIELD IF NOT EXISTS iso_code ON language TYPE string;
        DEFINE FIELD IF NOT EXISTS is_active ON language TYPE bool DEFAULT true;
        DEFINE FIELD IF NOT EXISTS created_at ON language TYPE datetime DEFAULT time::now();
        DEFINE FIELD IF NOT EXISTS updated_at ON language TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS address SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS street ON address TYPE string;
        DEFINE FIELD IF NOT EXISTS city ON address TYPE string;
        DEFINE FIELD IF NOT EXISTS state ON address TYPE string;
        DEFINE FIELD IF NOT EXISTS zip_code ON address TYPE string;
        DEFINE FIELD IF NOT EXISTS country ON address TYPE record<country>;
        DEFINE FIELD IF NOT EXISTS is_active ON address TYPE bool DEFAULT true;
        DEFINE FIELD IF NOT EXISTS created_at ON address TYPE datetime DEFAULT time::now();
        DEFINE FIELD IF NOT EXISTS updated_at ON address TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS book SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS title ON book TYPE string;
        DEFINE FIELD IF NOT EXISTS isbn ON book TYPE string;
        DEFINE FIELD IF NOT EXISTS publication_date ON book TYPE datetime;
        DEFINE FIELD IF NOT EXISTS publisher ON book TYPE record<publisher>;
        DEFINE FIELD IF NOT EXISTS authors ON book TYPE array<record<author>>;
        DEFINE FIELD IF NOT EXISTS languages ON book TYPE array<record<language>>;
        DEFINE FIELD IF NOT EXISTS is_active ON book TYPE bool DEFAULT true;
        DEFINE FIELD IF NOT EXISTS created_at ON book TYPE datetime DEFAULT time::now();
        DEFINE FIELD IF NOT EXISTS updated_at ON book TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS user SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD first_name ON user TYPE string;
        DEFINE FIELD last_name ON user TYPE string;
        DEFINE FIELD email ON user TYPE string;
        DEFINE FIELD password_hash ON user TYPE string;
        DEFINE FIELD avatar ON user TYPE option<string>;
        DEFINE FIELD bio ON user TYPE option<string>;
        DEFINE FIELD is_active ON user TYPE bool DEFAULT true;
        DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now();
        DEFINE FIELD updated_at ON user TYPE datetime VALUE time::now();

        DEFINE INDEX idx_user_email ON user FIELDS email UNIQUE;

        DEFINE TABLE IF NOT EXISTS customer SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS first_name ON customer TYPE string;
        DEFINE FIELD IF NOT EXISTS last_name ON customer TYPE string;
        DEFINE FIELD IF NOT EXISTS email ON customer TYPE string;
        DEFINE FIELD IF NOT EXISTS addresses ON customer TYPE option<array<record<address>>>;
        DEFINE FIELD IF NOT EXISTS is_active ON customer TYPE bool DEFAULT true;
        DEFINE FIELD IF NOT EXISTS created_at ON customer TYPE datetime DEFAULT time::now();
        DEFINE FIELD IF NOT EXISTS updated_at ON customer TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS has_address SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS in ON has_address TYPE record<customer>;
        DEFINE FIELD IF NOT EXISTS out ON has_address TYPE record<address>;

        DEFINE TABLE IF NOT EXISTS has_language SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS in ON has_language TYPE record<book>;
        DEFINE FIELD IF NOT EXISTS out ON has_language TYPE record<language>;

        DEFINE TABLE IF NOT EXISTS wrote SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD IF NOT EXISTS in ON wrote TYPE record<author>;
        DEFINE FIELD IF NOT EXISTS out ON wrote TYPE record<book>;
    `);
  } catch (error) {
    console.error(error);
  }
};
