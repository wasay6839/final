/* ============================================================
   FIFO – Player Card System  (LAB-13)
   ============================================================ */

'use strict';

// ────────────────────────────────────────────────────────────
// 1.  PLAYER DATA — Real player portrait photos
//     Images: FIFA/UEFA official press + Wikipedia Commons
//     These URLs load directly in browsers (no server-side fetch)
// ────────────────────────────────────────────────────────────
const SEED_PLAYERS = [
  {
    id: 1, name: 'Lionel Messi', jersey: 10,
    position: 'Forward', club: 'Inter Miami CF', league: 'MLS',
    rating: 93, nationality: '🇦🇷 Argentina',
    img: 'https://api.sofascore.app/api/v1/player/41955/image',
    stats: { goals: 18, assists: 16, matches: 26, pace: 85, shooting: 95, passing: 93, dribbling: 97, defending: 40, physical: 65 }
  },
  {
    id: 2, name: 'Cristiano Ronaldo', jersey: 7,
    position: 'Forward', club: 'Al-Nassr', league: 'Saudi Pro',
    rating: 90, nationality: '🇵🇹 Portugal',
    img: 'https://api.sofascore.app/api/v1/player/750692/image',
    stats: { goals: 35, assists: 8, matches: 38, pace: 83, shooting: 95, passing: 82, dribbling: 88, defending: 35, physical: 80 }
  },
  {
    id: 3, name: 'Erling Haaland', jersey: 9,
    position: 'Striker', club: 'Manchester City', league: 'Premier League',
    rating: 92, nationality: '🇳🇴 Norway',
    img: 'https://api.sofascore.app/api/v1/player/839956/image',
    stats: { goals: 41, assists: 7, matches: 43, pace: 89, shooting: 94, passing: 70, dribbling: 81, defending: 44, physical: 88 }
  },
  {
    id: 4, name: 'Kylian Mbappé', jersey: 7,
    position: 'Forward', club: 'Real Madrid', league: 'La Liga',
    rating: 94, nationality: '🇫🇷 France',
    img: 'https://api.sofascore.app/api/v1/player/766726/image',
    stats: { goals: 27, assists: 12, matches: 34, pace: 97, shooting: 92, passing: 84, dribbling: 93, defending: 38, physical: 78 }
  },
  {
    id: 5, name: 'Vinicius Jr.', jersey: 7,
    position: 'Winger', club: 'Real Madrid', league: 'La Liga',
    rating: 91, nationality: '🇧🇷 Brazil',
    img: 'https://api.sofascore.app/api/v1/player/877664/image',
    stats: { goals: 23, assists: 14, matches: 36, pace: 96, shooting: 86, passing: 80, dribbling: 95, defending: 27, physical: 70 }
  },
  {
    id: 6, name: 'Rodri', jersey: 16,
    position: 'Midfielder', club: 'Manchester City', league: 'Premier League',
    rating: 91, nationality: '🇪🇸 Spain',
    img: 'https://api.sofascore.app/api/v1/player/732765/image',
    stats: { goals: 8, assists: 12, matches: 37, pace: 73, shooting: 77, passing: 91, dribbling: 82, defending: 87, physical: 83 }
  },
  {
    id: 7, name: 'Jude Bellingham', jersey: 5,
    position: 'Midfielder', club: 'Real Madrid', league: 'La Liga',
    rating: 91, nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
    img: 'https://api.sofascore.app/api/v1/player/1077474/image',
    stats: { goals: 19, assists: 11, matches: 35, pace: 82, shooting: 85, passing: 88, dribbling: 88, defending: 73, physical: 82 }
  },
  {
    id: 8, name: 'Harry Kane', jersey: 9,
    position: 'Striker', club: 'Bayern Munich', league: 'Bundesliga',
    rating: 90, nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
    img: 'https://api.sofascore.app/api/v1/player/202126/image',
    stats: { goals: 36, assists: 10, matches: 40, pace: 75, shooting: 95, passing: 85, dribbling: 80, defending: 47, physical: 84 }
  },
  {
    id: 9, name: 'Kevin De Bruyne', jersey: 17,
    position: 'Midfielder', club: 'Manchester City', league: 'Premier League',
    rating: 91, nationality: '🇧🇪 Belgium',
    img: 'https://api.sofascore.app/api/v1/player/70996/image',
    stats: { goals: 7, assists: 22, matches: 32, pace: 78, shooting: 87, passing: 96, dribbling: 87, defending: 64, physical: 78 }
  },
  {
    id: 10, name: 'Mohamed Salah', jersey: 11,
    position: 'Winger', club: 'Liverpool', league: 'Premier League',
    rating: 90, nationality: '🇪🇬 Egypt',
    img: 'https://api.sofascore.app/api/v1/player/165529/image',
    stats: { goals: 29, assists: 13, matches: 38, pace: 91, shooting: 90, passing: 82, dribbling: 90, defending: 45, physical: 76 }
  },
  {
    id: 11, name: 'Pedri', jersey: 8,
    position: 'Midfielder', club: 'FC Barcelona', league: 'La Liga',
    rating: 88, nationality: '🇪🇸 Spain',
    img: 'https://api.sofascore.app/api/v1/player/934169/image',
    stats: { goals: 9, assists: 13, matches: 33, pace: 79, shooting: 80, passing: 90, dribbling: 91, defending: 70, physical: 67 }
  },
  {
    id: 12, name: 'Lautaro Martínez', jersey: 10,
    position: 'Striker', club: 'Inter Milan', league: 'Serie A',
    rating: 89, nationality: '🇦🇷 Argentina',
    img: 'https://api.sofascore.app/api/v1/player/802655/image',
    stats: { goals: 27, assists: 9, matches: 36, pace: 80, shooting: 90, passing: 76, dribbling: 84, defending: 43, physical: 80 }
  },
  {
    id: 13, name: 'Thibaut Courtois', jersey: 1,
    position: 'Goalkeeper', club: 'Real Madrid', league: 'La Liga',
    rating: 91, nationality: '🇧🇪 Belgium',
    img: 'https://api.sofascore.app/api/v1/player/32827/image',
    stats: { goals: 0, assists: 0, matches: 30, pace: 52, shooting: 30, passing: 72, dribbling: 48, defending: 96, physical: 88 }
  },
  {
    id: 14, name: 'Bukayo Saka', jersey: 7,
    position: 'Winger', club: 'Arsenal', league: 'Premier League',
    rating: 87, nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
    img: 'https://api.sofascore.app/api/v1/player/916894/image',
    stats: { goals: 20, assists: 14, matches: 38, pace: 88, shooting: 83, passing: 84, dribbling: 87, defending: 65, physical: 72 }
  },
  {
    id: 15, name: 'Rúben Dias', jersey: 3,
    position: 'Defender', club: 'Manchester City', league: 'Premier League',
    rating: 88, nationality: '🇵🇹 Portugal',
    img: 'https://api.sofascore.app/api/v1/player/785731/image',
    stats: { goals: 3, assists: 2, matches: 35, pace: 74, shooting: 55, passing: 78, dribbling: 66, defending: 92, physical: 85 }
  },
  {
    id: 16, name: 'Robert Lewandowski', jersey: 9,
    position: 'Striker', club: 'FC Barcelona', league: 'La Liga',
    rating: 90, nationality: '🇵🇱 Poland',
    img: 'https://api.sofascore.app/api/v1/player/196286/image',
    stats: { goals: 28, assists: 6, matches: 34, pace: 78, shooting: 93, passing: 79, dribbling: 82, defending: 44, physical: 82 }
  },
  {
    id: 17, name: 'Antoine Griezmann', jersey: 7,
    position: 'Forward', club: 'Atletico Madrid', league: 'La Liga',
    rating: 87, nationality: '🇫🇷 France',
    img: 'https://api.sofascore.app/api/v1/player/67895/image',
    stats: { goals: 22, assists: 11, matches: 37, pace: 82, shooting: 88, passing: 84, dribbling: 85, defending: 58, physical: 75 }
  },
  {
    id: 18, name: 'Phil Foden', jersey: 47,
    position: 'Midfielder', club: 'Manchester City', league: 'Premier League',
    rating: 89, nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
    img: 'https://api.sofascore.app/api/v1/player/843054/image',
    stats: { goals: 19, assists: 8, matches: 35, pace: 83, shooting: 86, passing: 87, dribbling: 90, defending: 60, physical: 68 }
  },
  {
    id: 19, name: 'Ousmane Dembélé', jersey: 7,
    position: 'Winger', club: 'PSG', league: 'Ligue 1',
    rating: 86, nationality: '🇫🇷 France',
    img: 'https://api.sofascore.app/api/v1/player/814918/image',
    stats: { goals: 18, assists: 19, matches: 35, pace: 94, shooting: 83, passing: 81, dribbling: 91, defending: 35, physical: 71 }
  },
  {
    id: 20, name: 'Bernardo Silva', jersey: 20,
    position: 'Midfielder', club: 'Manchester City', league: 'Premier League',
    rating: 88, nationality: '🇵🇹 Portugal',
    img: 'https://api.sofascore.app/api/v1/player/734655/image',
    stats: { goals: 11, assists: 13, matches: 36, pace: 80, shooting: 83, passing: 89, dribbling: 88, defending: 68, physical: 75 }
  }
];

// ────────────────────────────────────────────────────────────
// 2.  STORAGE HELPERS
// ────────────────────────────────────────────────────────────
const LS_KEY = 'fifo_players_v4';

function seedLocalStorage() {
  localStorage.setItem(LS_KEY, JSON.stringify(SEED_PLAYERS));
}

async function fetchPlayersFromStorage() {
  try {
    const r = await fetch('http://localhost:3000/players');
    if (!r.ok) throw new Error('API error');
    return await r.json();
  } catch {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : SEED_PLAYERS;
  }
}

// ────────────────────────────────────────────────────────────
// 3.  STATE
// ────────────────────────────────────────────────────────────
let allPlayers   = [];
let searchQuery  = '';
let leagueFilter = 'all';
let ratingFilter = 'all';

// ────────────────────────────────────────────────────────────
// 4.  FILTER + SORT
// ────────────────────────────────────────────────────────────
function applyFilters(players) {
  let result = [...players];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(p => p.name.toLowerCase().includes(q));
  }
  if (leagueFilter !== 'all') result = result.filter(p => p.league === leagueFilter);
  if (ratingFilter !== 'all') {
    const min = parseInt(ratingFilter, 10);
    result = result.filter(p => p.rating >= min);
    result.sort((a, b) => b.rating - a.rating);
  }
  return result;
}

// ────────────────────────────────────────────────────────────
// 5.  BUILD CARD
// ────────────────────────────────────────────────────────────
function buildStatBar(label, value) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 90 ? '#EAB308' : pct >= 80 ? '#06B6D4' : '#475569';
  return `
    <div class="card-back-bar-wrap">
      <div class="card-back-bar-label">
        <span>${label}</span><span style="color:${color};font-weight:700;">${value}</span>
      </div>
      <div class="card-back-bar">
        <div class="card-back-bar-fill" style="width:${pct}%;background:${color};"></div>
      </div>
    </div>`;
}

function getTier(rating) {
  if (rating >= 91) return 'diamond';
  if (rating >= 90) return 'elite';
  return 'standard';
}

function buildCard(player, index) {
  const tier = getTier(player.rating);
  const isDiamond = tier === 'diamond';
  const isElite   = tier === 'elite';
  const tierClass = isDiamond ? 'diamond' : isElite ? 'elite-card' : '';

  const badgeHtml = isDiamond
    ? `<div class="diamond-badge">💎 DIAMOND</div>`
    : isElite
    ? `<div class="elite-badge">⭐ ELITE</div>`
    : '';

  // Initials avatar fallback when image fails to load
  const initials = player.name.split(' ').map(w => w[0]).join('').slice(0,2);
  const fallbackStyle = `background:linear-gradient(135deg,#0A1020,#162035);display:flex;align-items:center;justify-content:center;`;

  return `
  <div class="card-scene flip-in ${tierClass}" style="--i:${index}" data-id="${player.id}">
    <div class="card-flipper">

      <!-- FRONT -->
      <div class="card-front">
        <div class="card-img-wrap">
          <img class="card-img"
               src="${player.img}"
               alt="${player.name}"
               loading="lazy"
               onerror="this.onerror=null;this.style.cssText='${fallbackStyle}';this.insertAdjacentHTML('afterend','<div style=\\'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:Orbitron,monospace;font-size:3rem;font-weight:900;color:rgba(6,182,212,0.4);z-index:1\\'>${initials}</div>');"/>
          <div class="card-img-overlay"></div>
          <div class="card-jersey">#${player.jersey}</div>
          <div class="card-rating">${player.rating}</div>
          ${badgeHtml}
        </div>
        <div class="card-body">
          <span class="card-position-tag">${player.position} · ${player.nationality}</span>
          <div class="card-name">${player.name}</div>
          <div class="card-club-row">
            <div class="card-club-dot"></div>
            <span class="card-club">${player.club} · ${player.league}</span>
          </div>
          <div class="card-stats-row">
            <div class="card-stat">
              <div class="card-stat-val">${player.stats.goals}</div>
              <div class="card-stat-lbl">Goals</div>
            </div>
            <div class="card-stat">
              <div class="card-stat-val">${player.stats.assists}</div>
              <div class="card-stat-lbl">Assist</div>
            </div>
            <div class="card-stat">
              <div class="card-stat-val">${player.stats.matches}</div>
              <div class="card-stat-lbl">Apps</div>
            </div>
          </div>
        </div>
        <div class="card-flip-hint">↻ HOVER TO FLIP</div>
      </div>

      <!-- BACK -->
      <div class="card-back">
        <div class="card-back-header">
          <div class="card-back-name">${player.name}</div>
          <div class="card-back-club">${player.club}</div>
        </div>
        <div class="card-back-stat-row">
          <span class="card-back-stat-key">Position</span>
          <span class="card-back-stat-val">${player.position}</span>
        </div>
        <div class="card-back-stat-row">
          <span class="card-back-stat-key">Nation</span>
          <span class="card-back-stat-val" style="font-size:0.75rem;">${player.nationality}</span>
        </div>
        <div class="card-back-stat-row">
          <span class="card-back-stat-key">OVR</span>
          <span class="card-back-stat-val" style="color:#EAB308;font-size:1.1rem;">${player.rating}</span>
        </div>
        ${buildStatBar('PAC', player.stats.pace)}
        ${buildStatBar('SHO', player.stats.shooting)}
        ${buildStatBar('PAS', player.stats.passing)}
        ${buildStatBar('DRI', player.stats.dribbling)}
        ${buildStatBar('DEF', player.stats.defending)}
        ${buildStatBar('PHY', player.stats.physical)}
      </div>

    </div>
  </div>`;
}

// ────────────────────────────────────────────────────────────
// 6.  RENDER
// ────────────────────────────────────────────────────────────
function renderCards(players) {
  const grid    = document.getElementById('playersGrid');
  const counter = document.getElementById('playerCount');
  if (!grid) return;

  const filtered = applyFilters(players);
  if (counter) counter.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚽</div>
        <div class="empty-state-title">No Players Found</div>
        <div class="empty-state-sub">Try adjusting your search or filters</div>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((p, i) => buildCard(p, i)).join('');
  grid.querySelectorAll('.card-scene').forEach((card, i) => {
    setTimeout(() => card.classList.remove('flip-in'), i * 60 + 650);
  });
}

// ────────────────────────────────────────────────────────────
// 7.  LEAGUE DROPDOWN
// ────────────────────────────────────────────────────────────
function populateLeagueDropdown(players) {
  const sel = document.getElementById('leagueFilter');
  if (!sel) return;
  while (sel.options.length > 1) sel.remove(1);
  const leagues = [...new Set(players.map(p => p.league))].sort();
  leagues.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l; opt.textContent = l;
    sel.appendChild(opt);
  });
}

// ────────────────────────────────────────────────────────────
// 8.  EVENT LISTENERS
// ────────────────────────────────────────────────────────────
function attachFilterListeners() {
  let searchTimer;
  const searchEl = document.getElementById('playerSearch');
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { searchQuery = this.value; renderCards(allPlayers); }, 250);
    });
  }
  const leagueEl = document.getElementById('leagueFilter');
  if (leagueEl) leagueEl.addEventListener('change', function () { leagueFilter = this.value; renderCards(allPlayers); });
  const ratingEl = document.getElementById('ratingFilter');
  if (ratingEl) ratingEl.addEventListener('change', function () { ratingFilter = this.value; renderCards(allPlayers); });
}

// ────────────────────────────────────────────────────────────
// 9.  INIT
// ────────────────────────────────────────────────────────────
async function init() {
  seedLocalStorage();
  allPlayers = await fetchPlayersFromStorage();
  populateLeagueDropdown(allPlayers);
  attachFilterListeners();
  renderCards(allPlayers);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
