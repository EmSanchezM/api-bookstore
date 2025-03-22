DEFINE TABLE IF NOT EXISTS country SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD name ON country TYPE string;
        DEFINE FIELD iso_code ON country TYPE string;
        DEFINE FIELD is_active ON country TYPE bool DEFAULT true;
        DEFINE FIELD created_at ON country TYPE datetime DEFAULT time::now();
        DEFINE FIELD updated_at ON country TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS publisher SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD name ON publisher TYPE string;
        DEFINE FIELD website ON publisher TYPE string;
        DEFINE FIELD is_active ON publisher TYPE bool DEFAULT true;
        DEFINE FIELD created_at ON publisher TYPE datetime DEFAULT time::now();
        DEFINE FIELD updated_at ON publisher TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS author SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD first_name ON author TYPE string;
        DEFINE FIELD last_name ON author TYPE string;
        DEFINE FIELD nationality ON author TYPE string;
        DEFINE FIELD biography ON author TYPE option<string>;
        DEFINE FIELD awards ON author TYPE option<array<string>>;
        DEFINE FIELD genres ON author TYPE option<array<string>>;
        DEFINE FIELD notable_works ON author TYPE option<array<string>>;
        DEFINE FIELD website ON author TYPE option<string>;
        DEFINE FIELD social_links ON author TYPE option<object>;
        DEFINE FIELD social_links.facebook ON social_links TYPE option<string>;
        DEFINE FIELD social_links.twitter ON social_links TYPE option<string>;
        DEFINE FIELD social_links.instagram ON social_links TYPE option<string>;
        DEFINE FIELD birth_date ON author TYPE datetime;
        DEFINE FIELD date_of_death ON author TYPE option<datetime>;
        DEFINE FIELD is_active ON author TYPE bool DEFAULT true;
        DEFINE FIELD created_at ON author TYPE datetime DEFAULT time::now();
        DEFINE FIELD updated_at ON author TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS language SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD name ON language TYPE string;
        DEFINE FIELD iso_code ON language TYPE string;
        DEFINE FIELD is_active ON language TYPE bool DEFAULT true;
        DEFINE FIELD created_at ON language TYPE datetime DEFAULT time::now();
        DEFINE FIELD updated_at ON language TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS address SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD street ON address TYPE string;
        DEFINE FIELD city ON address TYPE string;
        DEFINE FIELD state ON address TYPE string;
        DEFINE FIELD zip_code ON address TYPE string;
        DEFINE FIELD country ON address TYPE record<country>;
        DEFINE FIELD is_active ON address TYPE bool DEFAULT true;
        DEFINE FIELD created_at ON address TYPE datetime DEFAULT time::now();
        DEFINE FIELD updated_at ON address TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS book SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD title ON book TYPE string;
        DEFINE FIELD isbn ON book TYPE string;
        DEFINE FIELD publication_date ON book TYPE datetime;
        DEFINE FIELD publisher ON book TYPE record<publisher>;
        DEFINE FIELD authors ON book TYPE array<record<author>>;
        DEFINE FIELD languages ON book TYPE array<record<language>>;
        DEFINE FIELD is_active ON book TYPE bool DEFAULT true;
        DEFINE FIELD created_at ON book TYPE datetime DEFAULT time::now();
        DEFINE FIELD updated_at ON book TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS customer SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD first_name ON customer TYPE string;
        DEFINE FIELD last_name ON customer TYPE string;
        DEFINE FIELD email ON customer TYPE string;
        DEFINE FIELD addresses ON customer TYPE array<record<address>>;
        DEFINE FIELD is_active ON customer TYPE bool DEFAULT true;
        DEFINE FIELD created_at ON customer TYPE datetime DEFAULT time::now();
        DEFINE FIELD updated_at ON customer TYPE datetime VALUE time::now();

        DEFINE TABLE IF NOT EXISTS has_address SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD in ON has_address TYPE record<customer>;
        DEFINE FIELD out ON has_address TYPE record<address>;

        DEFINE TABLE IF NOT EXISTS has_language SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD in ON has_language TYPE record<book>;
        DEFINE FIELD out ON has_language TYPE record<language>;
      
        DEFINE TABLE IF NOT EXISTS wrote SCHEMAFULL
          PERMISSIONS
            FOR select FULL,
            FOR create FULL,
            FOR update FULL,
            FOR delete FULL;

        DEFINE FIELD in ON wrote TYPE record<author>;
        DEFINE FIELD out ON wrote TYPE record<book>;