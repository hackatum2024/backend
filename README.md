# Launch the app

You can launch the app using 
`docker compose up`

Use the flag `-d` for detached mode (no blocking in terminal) and `--build` if you don't want to cache the containers (important if you made config changes).



You can log in and play with the DB container 
`docker exec -it backend-db-1 psql -U postgres -d rental_db`.
