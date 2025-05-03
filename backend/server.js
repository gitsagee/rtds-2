const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;


app.post('/api/get-gpu-pricing', async (req, res) => {
  const { region } = req.body;

  let apiUrl;
  if (region === 'mumbai') {
    apiUrl = 'https://customer.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances&region=ap-south-mum-1';
  } else if (region === 'noida') {
    apiUrl = 'https://customer.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances&region=ap-south-noi-1';
  } else if (region === 'us-east') {
    apiUrl = 'https://customer.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances&region=us-east-at-1';
  } else {
    return res.status(400).json({ error: 'Invalid region provided' });
  }

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Failed to fetch GPU pricing data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
