const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectMongoDB, mysqlPool } = require('./db/connectDB');
const fetch_routes = require('./routes/fetch.routes');
const crud_routes = require('./routes/crud.routes');
const auth_routes = require('./routes/auth.routes');
require('dotenv').config();
require('./config/passport');

const app = express();
const port = process.env.PORT || 5001;

(async () => {
  await connectMongoDB();
})();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use("/fetch", fetch_routes);
app.use("/crud", crud_routes);
app.use("/auth", auth_routes);

app.get('/', (req, res) => {
  res.send(`User-related services running on http://localhost:${port}`);
});

app.listen(port, () => {
  console.log(`🚀 User-related services running on http://localhost:${port}`);
});