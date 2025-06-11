const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectMongoDB } = require('./db/connectDB');
const fetch_routes = require('./routes/fetch.routes');
const crud_routes = require('./routes/crud.routes');
const auth_routes = require('./routes/auth.routes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Connect to MongoDB
// Connect to MongoDB
(async () => {
  await connectMongoDB();
})();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS config to allow cookies from frontend

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Routes
app.use("/fetch", fetch_routes);
console.log("📦 Fetch routes mounted at /fetch");

app.use("/crud", crud_routes);
console.log("🛠️ CRUD routes mounted at /crud");

app.use("/auth", auth_routes);
console.log("🔐 Auth routes mounted at /auth");

app.get('/', (req, res) => {
  res.send(`User-related services running on http://localhost:${port}`);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 User-related services running on http://localhost:${port}`);
});
