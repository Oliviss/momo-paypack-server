const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/paypack/cashin', async (req, res) => {
    const { number, amount } = req.body;

    if (!number || !amount) {
        return res.status(400).json({ success: false, message: "Nomero n'amafaranga birakenewe." });
    }

    console.log(`Ubusabe bwakiriwe: Inomero ${number}, Amafaranga ${amount} FRW`);

    return.status(200).json({ 
        success: true, 
        message: "Prompt ya MTN MoMo yoherejwe kuri telefone yawe neza!" 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server irimo gukora kuri port ${PORT}`));
