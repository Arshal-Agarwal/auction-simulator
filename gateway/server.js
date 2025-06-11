const express = require('express');
const fetch = require('node-fetch'); // Import node-fetch
require('dotenv').config();

const app = express();
app.use(express.json());

// Utility function to handle proxy requests
const proxyRequest = async (req, res, target) => {
  try {
    const url = `${target}${req.url}`; // Construct the full URL
    console.log(`Proxying request to: ${url}`);

    const fetchOptions = {
      method: req.method,
      headers: {
        ...req.headers,  // Forward all client headers
        host: new URL(target).host // Set the correct Host header
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    };

    // Log outgoing request headers for debugging
    console.log('Outgoing Headers:', fetchOptions.headers);

    const response = await fetch(url, fetchOptions);

    // Forward the status code and headers from the backend
    res.status(response.status);
    for (const [header, value] of response.headers.entries()) {
      res.setHeader(header, value);
    }

    // Send the response body back to the client
    const body = await response.text();
    res.send(body);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).send('Proxy Error');
  }
};

// Proxy to User Service
app.use('/users', async (req, res) => {
  await proxyRequest(req, res, 'http://localhost:5001');
});

// Proxy to Friends Service
app.use('/friends', async (req, res) => {
  await proxyRequest(req, res, 'http://localhost:5002');
});

// Proxy to Message Service
app.use('/messages', async (req, res) => {
  await proxyRequest(req, res, 'http://localhost:5003');
});

// Health route
app.get('/', (req, res) => {
  res.send('Gateway is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway is running on port ${PORT}`);
});
