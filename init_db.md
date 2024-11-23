# Start PostgreSQL service if not running

brew services start postgresql

# Create the database (as your user)

createdb car_rental

# Connect to PostgreSQL (as your user - no need for postgres user on macOS)

psql car_rental

-- Inside psql
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE car_rental TO postgres;
\c car_rental
GRANT ALL ON SCHEMA public TO postgres;
