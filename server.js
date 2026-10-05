const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Niba ukoresha Node.js 18+, iyi 'node-fetch' ntabwo ari ngombwa, paji iri mu buhanga busanzwe

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 UBUBIKO BW'IBICIRO (Ushobora kongeramo ibicuruzwa byawe n'ibiciro byabyo hano)
const PRODUCTS_DB = {
  'ITEM_101': { name: 'Vip Ticket', price: 10000 },
  'ITEM_102': { name: 'Regular Ticket', price: 5000 },
  'DEFAULT_ITEM': { name: 'Igicuruzwa Gisanzwe', price: 1000 }
};

// 1. Endpoint yo kugaragaza izina n'igiciro kuri Frontend
app.get('/api/products/:itemId', (req, res) => {
  const item = PRODUCTS_DB[req.params.itemId];
  if (!item) {
    return res.status(404).json({ success: false, error: 'Igicuruzwa ntikibonetse' });
  }
  res.json({ success: true, data: item });
});

// 2. Endpoint yo kwakira ubwishyu no kubusaba PawaPay
app.post('/api/pay', async (req, res) => {
  try {
    const { phoneNumber, itemId } = req.body;

    // Shaka igiciro nyakuri mu bubiko
    const product = PRODUCTS_DB[itemId];
    if (!product) {
      return res.status(400).json({ success: false, error: 'Igicuruzwa cyatanzwe ntigihari' });
    }

    const realAmount = product.price;

    // Hamagara PawaPay API
    const pawapayResponse = await fetch('https://api.pawapay.io/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAWAPAY_API_KEY}`
      },
      body: JSON.stringify({
        payer: {
          type: 'MSISDN',
          address: { value: phoneNumber }
        },
        amount: String(realAmount),
        currency: 'RWF'
      })
    });

    const pawaData = await pawapayResponse.json();

    if (pawapayResponse.ok) {
      return res.json({ success: true, data: pawaData });
    } else {
      return res.status(400).json({ success: false, error: pawaData });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, error: 'Ikosa rya Server' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server iri gukora kuri port ${PORT}`));
