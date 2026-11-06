require("dotenv").config();
const { createApp } = require("./app");

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const app = await createApp();
  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  // Friendly message for the classic port conflict
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other process or set a different PORT in .env`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
}

module.exports = { start };
