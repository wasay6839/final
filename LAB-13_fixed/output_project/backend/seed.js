require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const Player       = require('./models/Player');
const Tournament   = require('./models/Tournament');
const Registration = require('./models/Registration');
const User         = require('./models/User');
const Contact      = require('./models/Contact');

// ── SEED DATA ────────────────────────────────────────────────────────────────

const PLAYERS = [
  { id:1, name:'Lionel Messi',      jersey:10, position:'Forward',    club:'Inter Miami CF',   league:'MLS',            rating:93, nationality:'Argentina', stats:{goals:18,assists:16,matches:26,pace:85,shooting:95,passing:93,dribbling:97,defending:40,physical:65} },
  { id:2, name:'Cristiano Ronaldo', jersey:7,  position:'Forward',    club:'Al-Nassr',          league:'Saudi Pro',      rating:90, nationality:'Portugal',  stats:{goals:35,assists:8, matches:38,pace:83,shooting:95,passing:82,dribbling:88,defending:35,physical:80} },
  { id:3, name:'Erling Haaland',    jersey:9,  position:'Striker',    club:'Manchester City',   league:'Premier League', rating:92, nationality:'Norway',    stats:{goals:41,assists:7, matches:43,pace:89,shooting:94,passing:70,dribbling:81,defending:44,physical:88} },
  { id:4, name:'Kylian Mbappe',     jersey:7,  position:'Forward',    club:'Real Madrid',       league:'La Liga',        rating:94, nationality:'France',    stats:{goals:27,assists:12,matches:34,pace:97,shooting:92,passing:84,dribbling:93,defending:38,physical:78} },
  { id:5, name:'Vinicius Jr.',      jersey:7,  position:'Winger',     club:'Real Madrid',       league:'La Liga',        rating:91, nationality:'Brazil',    stats:{goals:23,assists:14,matches:36,pace:96,shooting:86,passing:80,dribbling:95,defending:27,physical:70} },
  { id:6, name:'Rodri',             jersey:16, position:'Midfielder', club:'Manchester City',   league:'Premier League', rating:91, nationality:'Spain',     stats:{goals:8, assists:12,matches:37,pace:73,shooting:77,passing:91,dribbling:82,defending:87,physical:83} },
  { id:7, name:'Jude Bellingham',   jersey:5,  position:'Midfielder', club:'Real Madrid',       league:'La Liga',        rating:91, nationality:'England',   stats:{goals:19,assists:11,matches:35,pace:82,shooting:85,passing:88,dribbling:88,defending:73,physical:82} },
  { id:8, name:'Harry Kane',        jersey:9,  position:'Striker',    club:'Bayern Munich',     league:'Bundesliga',     rating:90, nationality:'England',   stats:{goals:36,assists:10,matches:40,pace:75,shooting:95,passing:85,dribbling:80,defending:47,physical:84} },
  { id:9, name:'Kevin De Bruyne',   jersey:17, position:'Midfielder', club:'Manchester City',   league:'Premier League', rating:91, nationality:'Belgium',   stats:{goals:7, assists:22,matches:32,pace:78,shooting:87,passing:96,dribbling:87,defending:64,physical:78} },
  { id:10,name:'Mohamed Salah',     jersey:11, position:'Winger',     club:'Liverpool',         league:'Premier League', rating:90, nationality:'Egypt',     stats:{goals:29,assists:13,matches:38,pace:91,shooting:90,passing:82,dribbling:90,defending:45,physical:76} },
];

const TOURNAMENTS = [
  { id:1, name:'FIFO World Championship', short:'FWC',  type:'World Cup',    region:'Global',        status:'live',      stadium:'Estádio do Maracanã',       city:'Rio de Janeiro', country:'Brazil',       teams:32, matches:64,  prize:'$5,000,000', startDate:'March 2026', endDate:'June 2026'   },
  { id:2, name:'UEFA Champions League',   short:'UCL',  type:'Club',         region:'Europe',        status:'live',      stadium:'Wembley Stadium',           city:'London',         country:'England',      teams:36, matches:189, prize:'$2,000,000', startDate:'Sept 2025',  endDate:'May 2026'    },
  { id:3, name:'Copa América Elite',      short:'CA',   type:'Continental',  region:'South America', status:'upcoming',  stadium:'Estadio Monumental',        city:'Buenos Aires',   country:'Argentina',    teams:16, matches:32,  prize:'$800,000',   startDate:'July 2026',  endDate:'August 2026' },
  { id:4, name:'FIFO Youth Cup',          short:'FYC',  type:'Youth',        region:'Global',        status:'qualifying',stadium:'Allianz Arena',             city:'Munich',         country:'Germany',      teams:24, matches:52,  prize:'$500,000',   startDate:'May 2026',   endDate:'July 2026'   },
  { id:5, name:'Africa Cup of Nations',   short:'AFCON',type:'Continental',  region:'Africa',        status:'upcoming',  stadium:'Cairo International Stadium',city:'Cairo',         country:'Egypt',        teams:24, matches:52,  prize:'$400,000',   startDate:'Jan 2027',   endDate:'Feb 2027'    },
];

const REGISTRATIONS = [
  { playerName:'Ahmed Khan',    email:'ahmed@example.com',  phone:'+92-300-1234567', gameTitle:'FIFA 26', tournamentName:'FIFO World Championship', teamName:'Team Alpha',  registrationFee:150, paymentMethod:'Card',          paymentStatus:'Paid'    },
  { playerName:'Sara Johnson',  email:'sara@example.com',   phone:'+1-555-9876543',  gameTitle:'FIFA 26', tournamentName:'UEFA Champions League',   teamName:'Team Beta',   registrationFee:200, paymentMethod:'Bank Transfer', paymentStatus:'Paid'    },
  { playerName:'Carlos Ruiz',   email:'carlos@example.com', phone:'+34-612-345678',  gameTitle:'FIFA 26', tournamentName:'Copa América Elite',       teamName:'Team Gamma',  registrationFee:100, paymentMethod:'Cash',          paymentStatus:'Pending' },
  { playerName:'Yuki Tanaka',   email:'yuki@example.com',   phone:'+81-90-12345678', gameTitle:'FIFA 26', tournamentName:'FIFO Youth Cup',           teamName:'Team Delta',  registrationFee:75,  paymentMethod:'MetaMask',      paymentStatus:'Paid',   walletAddress:'0xAbC123', transactionHash:'0xTxHash001' },
  { playerName:'Maria Silva',   email:'maria@example.com',  phone:'+55-11-987654321',gameTitle:'FIFA 26', tournamentName:'FIFO World Championship', teamName:'Team Epsilon', registrationFee:150, paymentMethod:'Card',          paymentStatus:'Failed'  },
  { playerName:'Ali Hassan',    email:'ali@example.com',    phone:'+971-50-1234567', gameTitle:'FIFA 26', tournamentName:'Africa Cup of Nations',   teamName:'Team Zeta',   registrationFee:80,  paymentMethod:'Cash',          paymentStatus:'Pending' },
  { playerName:'James Wilson',  email:'james@example.com',  phone:'+44-7911-123456', gameTitle:'FIFA 26', tournamentName:'UEFA Champions League',   teamName:'Team Eta',    registrationFee:200, paymentMethod:'Bank Transfer', paymentStatus:'Paid'    },
  { playerName:'Fatima Malik',  email:'fatima@example.com', phone:'+92-321-7654321', gameTitle:'FIFA 26', tournamentName:'FIFO Youth Cup',           teamName:'Team Theta',  registrationFee:75,  paymentMethod:'Card',          paymentStatus:'Paid'    },
];

const CONTACTS = [
  { name:'John Doe',    email:'john@example.com',   subject:'Registration Query', message:'How do I register my team for the FIFO World Championship?'       },
  { name:'Emma Brown',  email:'emma@example.com',   subject:'Payment Issue',      message:'My payment failed but the amount was deducted. Please help!'       },
  { name:'Raza Ahmed',  email:'raza@example.com',   subject:'Schedule Info',      message:'When does the group stage draw take place for Copa América Elite?' },
];

// ── MAIN ─────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fifo_tournament';
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅ Connected to', uri);

  // Clear all collections
  console.log('\n🗑  Clearing existing data…');
  await Promise.all([
    Player.deleteMany({}),
    Tournament.deleteMany({}),
    Registration.deleteMany({}),
    User.deleteMany({}),
    Contact.deleteMany({}),
  ]);

  // Seed players
  await Player.insertMany(PLAYERS);
  console.log(`✅ Seeded ${PLAYERS.length} players`);

  // Seed tournaments
  await Tournament.insertMany(TOURNAMENTS);
  console.log(`✅ Seeded ${TOURNAMENTS.length} tournaments`);

  // Seed registrations
  await Registration.insertMany(REGISTRATIONS);
  console.log(`✅ Seeded ${REGISTRATIONS.length} registrations`);

  // Seed demo users (hashed passwords)
  const hash = await bcrypt.hash('Admin@1234', 12);
  await User.insertMany([
    { username: 'admin',        email: 'admin@fifo.com',        password: hash },
    { username: 'demo_player',  email: 'player@fifo.com',       password: await bcrypt.hash('Player@1234', 12) },
  ]);
  console.log('✅ Seeded 2 users  (admin@fifo.com / Admin@1234)');

  // Seed contacts
  await Contact.insertMany(CONTACTS);
  console.log(`✅ Seeded ${CONTACTS.length} contact messages`);

  console.log('\n🎉 Seed complete! Open MongoDB Compass → fifo_tournament to view all collections.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
