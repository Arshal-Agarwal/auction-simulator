const express = require('express');
const cors = require("cors");
const connectDB = require("./db/connectDB")

const app = express();
const port = 5002;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
app.listen(port, () => {
  console.log(`Server for friends related services running on http://localhost:${port}`);
});
