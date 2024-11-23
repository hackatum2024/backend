FROM postgres:14

# TODO: Move this into .env
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=rental_db

# Copy initialization scripts if you have any
COPY init/ /docker-entrypoint-initdb.d/

# Copy migrations
COPY migrations/ /migrations/

# Install node and sequelize-cli for migrations (if you want to run migrations from this container)
RUN apt-get update && apt-get install -y nodejs npm
RUN npm install -g sequelize-cli
