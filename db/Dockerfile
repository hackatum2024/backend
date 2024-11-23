FROM postgres:14

# TODO: Move this into .env
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=rental_db

# Copy initialization scripts if you have any
COPY init/ /docker-entrypoint-initdb.d/
