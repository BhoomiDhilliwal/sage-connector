const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 4000;

// Load from .env
const SAGE_USERNAME = process.env.SAGE_USERNAME;
const SAGE_PASSWORD = process.env.SAGE_PASSWORD;
const SAGE_BASE_URL = process.env.SAGE_BASE_URL;
const COMPANY_GUID = process.env.COMPANY_GUID;

const ALLOWED_ENTITIES = [
  'tradingAccounts',
  'salesInvoices',
  'commodities',
  'purchaseOrders',
  'productGroups',
  'salesOrders',
];

app.get('/fetch-sage', async (req, res) => {
  const entity = req.query.entity;

  if (!entity) {
    return res.status(400).json({ error: 'Missing ?entity= in query' });
  }

  if (!ALLOWED_ENTITIES.includes(entity)) {
    return res.status(403).json({ error: 'This entity is not allowed' });
  }

  const url = `${SAGE_BASE_URL}/${COMPANY_GUID}/${entity}?format=json`;

  try {
    const response = await axios.get(url, {
      auth: {
        username: SAGE_USERNAME,
        password: SAGE_PASSWORD
      }
    });

    // ✅ Optional: Forward to Server 2
    // await axios.post('http://localhost:5000/api/receive-data', {
    //   entity,
    //   data: response.data.$resources || []
    // });

    res.json({
      entity,
      count: response.data.$totalResults || 0,
      items: response.data.$resources || []
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from Sage SData' });
  }
});

app.listen(PORT, () => {
  console.log(`Sage API listening at http://localhost:${PORT}/fetch-sage`);
});
