// Tasks 4-6: Express server with routes and a 404 handler
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// GET / -> welcome text
app.get('/', (req, res) => {
  res.status(200).send('Welcome to my Express server!');
});

// GET /about -> JSON with name and section
app.get('/about', (req, res) => {
  res.status(200).json({ name: 'K.Vinay Vardhan', section: 'CSE(GEN-AI)2A&304' });
});

// GET /time -> current date and time
app.get('/time', (req, res) => {
  res.status(200).send(new Date().toString());
});

// Any unknown path -> 404
app.use((req, res) => {
  res.status(404).send('404 - Route not found');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
