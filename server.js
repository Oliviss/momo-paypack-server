const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 UBUBIKO BW'IBICIRO (Muri Backend)
const PRODUCTS_DB = {
  'ITEM_101': { name: 'Vip Ticket', price: 10000 },
  'ITEM_102': { name: 'Regular Ticket', price: 5000 },
  'DEFAULT_ITEM': { name: 'Igicuruzwa Gisanzwe', price: 1000 }
};

// 1. Endpoint yo kugaragaza amakuru y'igicuruzwa
app.get('/api/products/:itemId', (req, res) => {
  const item = PRODUCTS_DB[req.params.itemId];
  if (!item) {
    return res.status(404).json({ success: false, error: 'Igicuruzwa ntikibonetse' });
  }
  res.json({ success: true, data: item });
});

// 2. Endpoint yo KUSABA ubwishyu kuri PawaPay
app.post('/api/pay', async (req, res) => {
  try {
    const { phoneNumber, itemId } = req.body;

    const product = PRODUCTS_DB[itemId];
    if (!product) {
      return res.status(400).json({ success: false, error: 'Igicuruzwa cyatanzwe ntigihari' });
    }

    const realAmount = product.price;

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

// 3. Endpoint yo KUGENZURA status kuri PawaPay
app.get('/api/check-status/:depositId', async (req, res) => {
  try {
    const { depositId } = req.params;

    const response = await fetch(`https://api.pawapay.io/deposits/${depositId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAWAPAY_API_KEY}`
      }
    });

    const data = await response.json();

    if (response.ok && (data.status === 'COMPLETED' || data.status === 'SUCCESSFUL')) {
      return res.json({ success: true, status: 'COMPLETED', data: data });
    } else {
      return res.json({ success: false, status: data.status || 'PENDING', data: data });
    }
  } catch (error) {
    console.error('Status Check Error:', error);
    res.status(500).json({ success: false, error: 'Kugenzura byananiwe' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server iri gukora kuri port ${PORT}`));
