const { createApp } = require("../src/app");

let appPromise;

module.exports = async function handler(req, res) {
  try {
    if (!appPromise) appPromise = createApp();
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error("Failed to initialize the Books API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
