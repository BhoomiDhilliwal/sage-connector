const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000;

// Config
const SAGE_USERNAME = 'MANAGER';  
const SAGE_PASSWORD = '#Demo@2025';
const SAGE_BASE_URL = 'http://crmlanding:5495/sdata/accounts50/GCRM';
const COMPANY_GUID = '{3C87266A-B8AF-46EE-AF8E-D5E9A181DAAC}';

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

    // ✅ Forward to Server 2
    try {
      await axios.post('http://localhost:5000/api/receive-data', {
        entity,
        data: response.data.$resources || []
      });
      console.log(`✅ Forwarded ${entity} data to Server 2`);
    } catch (forwardError) {
      console.error('❌ Failed to send data to Server 2:', forwardError.message);
    }

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
