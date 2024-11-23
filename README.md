# Elysia with Bun runtime

## Requirements

- bun
- typescript
- pm2

## Some useful PM2 commands

```bash
pm2 list # List all processes
pm2 logs backend # View logs
pm2 restart backend # Restart the app
pm2 stop backend # Stop the app
pm2 delete backend # Remove the app from PM2
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

Open http://localhost:3000/ with your browser to see the result.
