# Launch the app

## Requirements

- bun
- typescript
- pm2

You can launch the app using
`docker compose up`

Use the flag `-d` for detached mode (no blocking in terminal) and `--build` if you don't want to cache the containers (important if you made config changes).

You can log in and play with the DB container
`docker exec -it backend-db-1 psql -U postgres -d rental_db`.

## Automated testing
Start the application with docker compose (above).

Then you can execute the tests with `bun test` in the root directory.

You can execute singular tests with the `-t` flag followed by the test name in double quotes (in bun output after '>' and before the squared brackets indicating execution time).

## Manually Testing the routes 
When you use the docker compose setup, you can post with e.g. this
```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "offers": [{
      "ID": "1wwwwwwwwwwwwwwwwwwwwwwwwwwww23",
      "data": "base64string",
      "mostSpecificRegionID": 1,
      "startDate": 1700745600000,
      "endDate": 1700832000000,
      "numberSeats": 5,
      "price": 10,
      "carType": "SUV",
      "hasVollkasko": true,
      "freeKilometers": 1000
    }]
  }' \
  http://localhost:80/api/offers
```
and delete with 

```
curl -X DELETE http://localhost:80/api/offers
```
## Some useful PM2 commands

```bash
pm2 list # List all processes
pm2 logs backend # View logs
pm2 restart backend # Restart the app
pm2 stop backend # Stop the app
pm2 delete backend # Remove the app from PM2
pm2 flush # Delete all logs
```

- Launch the backend initially with:
  ```
  pm2 start bun --name "backend" -- --bun -- run start
  ```

## Getting Started

To get started with this template, simply paste this command into your terminal:

```bash
bun create elysia ./elysia-example
```

## Development

To start the development server run:

```bash
bun run dev
```

# Open http://localhost:3000/ with your browser to see the result.
