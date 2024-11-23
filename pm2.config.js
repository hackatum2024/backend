// same as
// pm2 start --interpreter ~/.bun/bin/bun npm -- run start
module.exports = {
  name: "backend",
  script: "npm",
  args: "run start",
  interpreter: "bun",
  env: {
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
    NODE_ENV: "production",
  },
};
