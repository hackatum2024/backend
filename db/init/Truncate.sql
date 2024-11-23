CREATE OR REPLACE FUNCTION cleanUp(
        --> Truncates the table and resets the auto increment
        tableName VARCHAR(255)
    ) RETURNS void AS $$ BEGIN EXECUTE 'TRUNCATE TABLE ' || tableName || ' CASCADE';
EXECUTE 'ALTER SEQUENCE ' || tableName || '_id_seq RESTART WITH 1';
END;
$$ LANGUAGE plpgsql;