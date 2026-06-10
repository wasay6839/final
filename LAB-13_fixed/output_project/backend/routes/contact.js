const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

const router = express.Router();

// POST /api/contact
router.post('/contact', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, subject, message } = req.body;
  try {
    await Contact.create({ name, email, subject: subject || '', message });
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
