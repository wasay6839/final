const express = require('express');
const router  = express.Router();

// POST /api/payments/process
// Simulates a payment gateway — always approves, 1.5 s delay
router.post('/process', async (req, res) => {
  const { method, amount } = req.body;
  if (!method || amount == null) {
    return res.status(400).json({ success: false, message: 'method and amount are required' });
  }

  // Simulate gateway processing delay
  await new Promise(r => setTimeout(r, 1500));

  const txId = 'TXN-' + Date.now().toString(36).toUpperCase()
             + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  res.json({
    success:       true,
    transactionId: txId,
    message:       'Payment approved',
    method,
    amount,
    currency:      'USD',
    timestamp:     new Date().toISOString(),
  });
});

module.exports = router;
