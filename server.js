const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Check server status
app.get('/', (req, res) => {
  res.send('Rwanda Online Deals Backend is Running!');
});

// 1. ENDPOINT YO GUSABA UBWISHYU (Deposit Request)
app.post('/api/pay', async (req, res) => {
  const { phoneNumber, amount, depositId } = req.body;

  if (!phoneNumber || !amount || !depositId) {
    return res.status(400).json({ error: 'Za data zose (phoneNumber, amount, depositId) zirombeba!' });
  }

  try {
    const response = await axios.post(
      `${process.env.PAWAPAY_BASE_URL}/deposits`,
      {
        depositId: depositId, // Universal Unique Identifier (UUID)
        amount: amount.toString(),
        currency: 'RWF',
        country: 'RWA',
        correspondent: 'MTN_MOMO_RWA', // Cyangwa AIRTEL_OAPI_RWA
        payer: {
          type: 'MSISDN',
          address: {
            value: phoneNumber // Urugero: "25078xxxxxxx"
          }
        },
        customerTimestamp: new Date().toISOString(),
        statementDescription: 'RwandaOnlineDeals'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAWAPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error initiating deposit:', error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      error: error.response ? error.response.data : 'Server error'
    });
  }
});

// 2. ENDPOINT Y'I PAWAPAY CALLBACK (Ikiraro cya Status)
app.post('/api/pawapay-callback', (req, res) => {
  const callbackData = req.body;
  console.log('--- PAWAPAY CALLBACK RECEIVED ---');
  console.log(JSON.stringify(callbackData, null, 2));

  // Aha ni ho uzajya ushyira code igenzura niba status == 'COMPLETED'
  // Ugahita wemeza order muri Firebase Firestore yawe.

  // Buri gihe senda status 200 gukura pawaPay mu gushidikanya
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
