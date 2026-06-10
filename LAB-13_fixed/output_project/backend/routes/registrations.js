const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const Registration = require('../models/Registration');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const createRules = [
  body('playerName').trim().notEmpty().withMessage('Player name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('gameTitle').trim().notEmpty().withMessage('Game title is required'),
  body('tournamentName').trim().notEmpty().withMessage('Tournament name is required'),
  body('registrationFee').isNumeric().withMessage('Registration fee must be a number'),
  body('paymentMethod').optional().isIn(['MetaMask', 'Cash', 'Bank Transfer', 'Card']).withMessage('Invalid payment method'),
  body('paymentStatus').optional().isIn(['Pending', 'Paid', 'Failed']).withMessage('Invalid payment status'),
];

// GET /api/registrations  — optional ?search= and ?status=
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [{ playerName: re }, { email: re }, { tournamentName: re }, { teamName: re }, { gameTitle: re }];
    }
    if (status && status !== 'all') query.paymentStatus = status;
    const registrations = await Registration.find(query).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/registrations/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, paid, pending, failed] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ paymentStatus: 'Paid' }),
      Registration.countDocuments({ paymentStatus: 'Pending' }),
      Registration.countDocuments({ paymentStatus: 'Failed' }),
    ]);
    const revenueAgg = await Registration.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$registrationFee' } } },
    ]);
    const revenue = revenueAgg[0]?.total ?? 0;
    res.json({ total, paid, pending, failed, revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/registrations/:id
router.get('/:id', [param('id').isMongoId().withMessage('Invalid registration ID')], handleValidation, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    res.json(reg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/registrations
router.post('/', createRules, handleValidation, async (req, res) => {
  try {
    const reg = new Registration(req.body);
    await reg.save();
    res.status(201).json(reg);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/registrations/:id
router.put('/:id', [param('id').isMongoId().withMessage('Invalid registration ID')], handleValidation, async (req, res) => {
  try {
    const reg = await Registration.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    res.json(reg);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/registrations/:id
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid registration ID')], handleValidation, async (req, res) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    res.json({ message: 'Registration deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
