const express    = require('express');
const Anthropic  = require('@anthropic-ai/sdk');
const Tournament = require('../models/Tournament');
const Player     = require('../models/Player');
const Registration = require('../models/Registration');

const router = express.Router();

// Build system prompt from live database data
async function buildSystemPrompt() {
  const [tournaments, players, regAgg] = await Promise.all([
    Tournament.find({}).lean(),
    Player.find({}).sort({ rating: -1 }).lean(),
    Registration.aggregate([
      { $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$registrationFee', 0] } }
      }}
    ])
  ]);

  // Summarise registration stats
  const stats = { total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 };
  regAgg.forEach(r => {
    stats.total  += r.count;
    stats[r._id.toLowerCase()] = r.count;
    stats.revenue += r.revenue;
  });

  // Format tournaments
  const liveT    = tournaments.filter(t => t.status === 'live');
  const upcomingT= tournaments.filter(t => t.status === 'upcoming');
  const otherT   = tournaments.filter(t => !['live','upcoming'].includes(t.status));

  const fmtT = t =>
    `• ${t.name} (${t.short || '—'}) | Status: ${t.status.toUpperCase()} | Teams: ${t.teams} | ` +
    `Matches: ${t.matches} | Prize: ${t.prize} | ${t.startDate} → ${t.endDate} | ` +
    `Venue: ${t.stadium}, ${t.city}, ${t.country}`;

  const fmtP = p =>
    `• ${p.name} | ${p.position} | ${p.club} (${p.league}) | Rating: ${p.rating} | ` +
    `Goals: ${p.stats?.goals ?? 0} | Assists: ${p.stats?.assists ?? 0} | Nationality: ${p.nationality}`;

  return `You are FIFO Assist, the official AI assistant for the FIFO Tournament Management System.
Answer questions about tournaments, players, registrations, schedules, and how to use the website.
Be concise, helpful, and football-enthusiastic. Use emojis sparingly.
Today's date: ${new Date().toDateString()}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIVE TOURNAMENT DATA (from database)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIVE NOW (${liveT.length}):
${liveT.map(fmtT).join('\n') || 'None currently live.'}

UPCOMING (${upcomingT.length}):
${upcomingT.map(fmtT).join('\n') || 'None upcoming.'}

OTHER (qualifying / completed) (${otherT.length}):
${otherT.map(fmtT).join('\n') || '—'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOP PLAYERS (${players.length} in database, sorted by rating)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${players.map(fmtP).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGISTRATION STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total registrations : ${stats.total}
Paid                : ${stats.paid}
Pending             : ${stats.pending}
Failed              : ${stats.failed}
Total revenue       : $${stats.revenue.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEBSITE NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Register for a tournament : register.html
Admin dashboard           : admin.html
Player profiles           : players.html
Match schedule            : schedule.html
Contact / support         : contact.html
Sign up / Login           : signup.html / login.html

CONTACT:
Email  : info@fifotournament.com
Press  : press@fifotournament.com
Phone  : +1 (800) FIFO-2026
Tickets: tickets@fifotournament.com

REGISTRATION FEES (per tournament):
FIFO World Championship $100 | UEFA Champions League $80 | Copa América Elite $60 |
FIFO Youth Cup $40 | Africa Cup of Nations $50 | Euro Championship $70 |
Payment methods: Cash, Card, Bank Transfer, MetaMask (Sepolia testnet)

If a question is outside your knowledge, direct users to the contact form or email.`;
}

// ── SMART FALLBACK (rule-based, uses live DB data) ───────────────────────────
async function smartFallback(userMsg, tournaments, players, stats) {
  const q = userMsg.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|yo|sup|good\s*(morning|evening|afternoon))/.test(q)) {
    return `👋 Hello! I'm **FIFO Assist**. Ask me about tournaments, players, registration, schedule, or anything FIFO! 🏆`;
  }

  // Live tournaments
  if (/live|ongoing|current|now|playing|active/.test(q) && /tournament|competition|cup|league/.test(q)) {
    const live = tournaments.filter(t => t.status === 'live');
    if (!live.length) return 'No tournaments are live right now. Check back soon! ⚽';
    return `🟢 **Live Tournaments (${live.length}):**\n` +
      live.map(t => `• **${t.name}** — ${t.teams} teams | ${t.matches} matches | Prize: ${t.prize}\n  📅 ${t.startDate} → ${t.endDate} | 🏟️ ${t.stadium}, ${t.city}`).join('\n\n');
  }

  // Upcoming tournaments
  if (/upcoming|next|future|soon|planned/.test(q)) {
    const up = tournaments.filter(t => t.status === 'upcoming');
    if (!up.length) return 'No upcoming tournaments at the moment.';
    return `📅 **Upcoming Tournaments (${up.length}):**\n` +
      up.map(t => `• **${t.name}** (${t.short}) — Starts: ${t.startDate} | Prize: ${t.prize}`).join('\n');
  }

  // All tournaments
  if (/tournament|competition|all|list/.test(q)) {
    return `🏆 **All Tournaments (${tournaments.length}):**\n` +
      tournaments.map(t => `• **${t.name}** | Status: ${t.status.toUpperCase()} | Prize: ${t.prize} | ${t.startDate} → ${t.endDate}`).join('\n');
  }

  // Specific tournament lookup
  const matchedT = tournaments.find(t =>
    q.includes(t.name.toLowerCase()) || (t.short && q.includes(t.short.toLowerCase()))
  );
  if (matchedT) {
    return `🏆 **${matchedT.name}**\n` +
      `• Status: ${matchedT.status.toUpperCase()}\n` +
      `• Teams: ${matchedT.teams} | Matches: ${matchedT.matches}\n` +
      `• Prize Pool: ${matchedT.prize}\n` +
      `• Dates: ${matchedT.startDate} → ${matchedT.endDate}\n` +
      `• Venue: ${matchedT.stadium}, ${matchedT.city}, ${matchedT.country}`;
  }

  // Prize / money
  if (/prize|money|reward|winning|cash/.test(q)) {
    return `💰 **Prize Pools:**\n` +
      tournaments.map(t => `• ${t.name}: **${t.prize}**`).join('\n');
  }

  // Players / top players
  if (/player|star|best|top|who|messi|ronaldo|haaland|mbappe|salah|bellingham|kane|vinicius/.test(q)) {
    const top = players.slice(0, 5);
    const named = players.find(p => q.includes(p.name.toLowerCase().split(' ')[1] || p.name.toLowerCase()));
    if (named) {
      return `⭐ **${named.name}**\n` +
        `• Club: ${named.club} (${named.league})\n` +
        `• Position: ${named.position} | Rating: ${named.rating}\n` +
        `• Goals: ${named.stats?.goals} | Assists: ${named.stats?.assists} | Matches: ${named.stats?.matches}\n` +
        `• Nationality: ${named.nationality}`;
    }
    return `⭐ **Top 5 Players by Rating:**\n` +
      top.map(p => `• **${p.name}** (${p.rating}) — ${p.position} at ${p.club}`).join('\n') +
      `\n\nView all ${players.length} players at [players.html]`;
  }

  // Registration
  if (/register|registration|sign.?up|join|enroll|how.*(join|play|enter)/.test(q)) {
    return `📝 **How to Register:**\n` +
      `1. Go to **register.html**\n` +
      `2. Fill in your player details\n` +
      `3. Select a tournament\n` +
      `4. Choose payment: Cash, Card, Bank Transfer, or MetaMask\n` +
      `5. Submit — you're in! 🏆\n\n` +
      `💳 Registration fees vary by tournament (from $40 to $100).`;
  }

  // Stats / numbers
  if (/stat|number|count|how many|total|registr/.test(q)) {
    return `📊 **FIFO Statistics:**\n` +
      `• Tournaments: ${tournaments.length}\n` +
      `• Players: ${players.length}\n` +
      `• Total Registrations: ${stats.total}\n` +
      `• Paid: ${stats.paid} | Pending: ${stats.pending} | Failed: ${stats.failed}\n` +
      `• Revenue Collected: $${stats.revenue.toFixed(2)}`;
  }

  // Schedule
  if (/schedule|fixture|match|game|when|date/.test(q)) {
    return `📅 **Tournament Dates:**\n` +
      tournaments.map(t => `• **${t.name}**: ${t.startDate} → ${t.endDate} (${t.status})`).join('\n') +
      `\n\nFull schedule at schedule.html`;
  }

  // Contact
  if (/contact|email|phone|help|support|reach/.test(q)) {
    return `📬 **Contact FIFO:**\n` +
      `• Email: info@fifotournament.com\n` +
      `• Press: press@fifotournament.com\n` +
      `• Tickets: tickets@fifotournament.com\n` +
      `• Phone: +1 (800) FIFO-2026\n` +
      `• Contact form: contact.html`;
  }

  // Default
  return `I can help with:\n• 🏆 Tournaments & schedules\n• ⭐ Player profiles\n• 📝 Registration steps\n• 📊 Stats & standings\n• 📬 Contact info\n\nTry asking: "Which tournaments are live?" or "Show me top players" 😊`;
}

// POST /api/chat
router.post('/', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Fetch live DB data (needed for both AI and fallback)
  let tournaments = [], players = [], stats = { total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 };
  try {
    const [t, p, regAgg] = await Promise.all([
      Tournament.find({}).lean(),
      Player.find({}).sort({ rating: -1 }).lean(),
      Registration.aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus','Paid'] }, '$registrationFee', 0] } } } }
      ])
    ]);
    tournaments = t; players = p;
    regAgg.forEach(r => {
      stats.total += r.count;
      stats[r._id.toLowerCase()] = r.count;
      stats.revenue += r.revenue;
    });
  } catch (dbErr) {
    console.error('DB fetch error:', dbErr.message);
  }

  const lastMsg = messages[messages.length - 1]?.content || '';

  // Try Anthropic API first if key is configured
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const system = await buildSystemPrompt();

      const response = await client.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system,
        messages:   messages.map(m => ({ role: m.role, content: m.content })),
      });

      const reply = response.content?.[0]?.text ?? 'Sorry, I could not generate a response.';
      return res.json({ reply });
    } catch (err) {
      console.warn('Anthropic API unavailable, using smart fallback:', err.message?.slice(0, 80));
    }
  }

  // Smart fallback — always works with live DB data
  const reply = await smartFallback(lastMsg, tournaments, players, stats);
  res.json({ reply });
});

module.exports = router;
