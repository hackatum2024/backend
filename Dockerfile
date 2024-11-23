FROM oven/bun

WORKDIR /app

# Copy package.json and bun.lockb (if you have it)
COPY package.json .
COPY bun.lockb .

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .


EXPOSE 3000

# Use bun to run the application
CMD ["bun", "run", "start"]
