require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const PORT        = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fifo_tournament';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected:', MONGODB_URI))
  .catch(err => console.error('❌ MongoDB error:', err.message));

const Player     = require('./models/Player');
const Tournament = require('./models/Tournament');

// ── ROUTES ───────────────────────────────────────────────────────────────────

app.get('/players', async (req, res) => {
  try {
    const query = req.query.position
      ? { position: { $regex: new RegExp(`^${req.query.position}$`, 'i') } }
      : {};
    const players = await Player.find(query).select('-__v');
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.get('/players/:id', async (req, res) => {
  try {
    const p = await Player.findOne({ id: parseInt(req.params.id, 10) }).select('-__v');
    if (!p) return res.status(404).json({ error: 'Player not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

app.get('/tournaments', async (req, res) => {
  try {
    const query = req.query.status
      ? { status: { $regex: new RegExp(`^${req.query.status}$`, 'i') } }
      : {};
    const tournaments = await Tournament.find(query).select('-__v');
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

app.get('/teams', async (req, res) => {
  try {
    const players = await Player.find({}).select('club league rating -_id');
    const map = {};
    players.forEach(p => {
      if (!map[p.club]) map[p.club] = { name: p.club, league: p.league, playerCount: 0, totalRating: 0 };
      map[p.club].playerCount += 1;
      map[p.club].totalRating += p.rating;
    });
    const teams = Object.values(map).map(t => ({
      name: t.name, league: t.league, playerCount: t.playerCount,
      avgRating: Math.round((t.totalRating / t.playerCount) * 100) / 100
    }));
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// ── REGISTRATION API ─────────────────────────────────────────────────────────

app.use('/api/registrations', require('./routes/registrations'));

// ── AUTH & CONTACT APIs ──────────────────────────────────────────────────────

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/chat',     require('./routes/chat'));
app.use('/api',          require('./routes/contact'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbName: 'fifo_tournament'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`   Players:       GET /players`);
  console.log(`   Tournaments:   GET /tournaments`);
  console.log(`   Registrations: /api/registrations  (CRUD)`);
  console.log(`   Auth:          POST /api/auth/register | POST /api/auth/login`);
  console.log(`   Contact:       POST /api/contact`);
});
