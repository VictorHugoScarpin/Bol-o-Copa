import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  realtime: { transport: ws, params: { eventsPerSecond: -1 } },
  global: { fetch: fetch },
})








async function findWorldCupId() {
  const res = await fetch('https://free-api-live-football-data.p.rapidapi.com/football-get-all-leagues', {
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
      'Content-Type': 'application/json',
    }
  })
  const json = await res.json()
  const leagues = json?.response || json?.leagues || json || []
  const wc = leagues.filter ? leagues.filter(l => 
    JSON.stringify(l).toLowerCase().includes('world') || 
    JSON.stringify(l).toLowerCase().includes('cup')
  ) : json
  console.log('🌍 LIGAS COPA:', JSON.stringify(wc, null, 2))
}

















const FLAG_MAP = {
  'Brazil':'🇧🇷','Argentina':'🇦🇷','France':'🇫🇷','Germany':'🇩🇪',
  'Spain':'🇪🇸','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal':'🇵🇹','Netherlands':'🇳🇱',
  'Italy':'🇮🇹','Uruguay':'🇺🇾','Colombia':'🇨🇴','Mexico':'🇲🇽',
  'USA':'🇺🇸','Canada':'🇨🇦','Japan':'🇯🇵','South Korea':'🇰🇷',
  'Morocco':'🇲🇦','Senegal':'🇸🇳','Ghana':'🇬🇭','Nigeria':'🇳🇬',
  'Australia':'🇦🇺','Saudi Arabia':'🇸🇦','Iran':'🇮🇷','Qatar':'🇶🇦',
  'Croatia':'🇭🇷','Serbia':'🇷🇸','Switzerland':'🇨🇭','Belgium':'🇧🇪',
  'Denmark':'🇩🇰','Poland':'🇵🇱','Cameroon':'🇨🇲','Ecuador':'🇪🇨',
  'Tunisia':'🇹🇳','Costa Rica':'🇨🇷','Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Chile':'🇨🇱','Peru':'🇵🇪','Paraguay':'🇵🇾','Venezuela':'🇻🇪',
  'Bolivia':'🇧🇴','Austria':'🇦🇹','Turkey':'🇹🇷','Ukraine':'🇺🇦',
  'Honduras':'🇭🇳','Panama':'🇵🇦','Jamaica':'🇯🇲',
  'United States':'🇺🇸','IR Iran':'🇮🇷','Korea Republic':'🇰🇷',
  "Côte d'Ivoire":'🇨🇮','Algeria':'🇩🇿','Egypt':'🇪🇬',
  'New Zealand':'🇳🇿','Slovakia':'🇸🇰','Romania':'🇷🇴',
  'Hungary':'🇭🇺','Czechia':'🇨🇿','Slovenia':'🇸🇮',
  'Guatemala':'🇬🇹','El Salvador':'🇸🇻','South Africa':'🇿🇦',
  'Bosnia and Herzegovina':'🇧🇦','Bosnia-Herzegovina':'🇧🇦',
  'Bosnia & Herzegovina':'🇧🇦','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Uzbekistan':'🇺🇿','Jordan':'🇯🇴','Iraq':'🇮🇶',
  'Haiti':'🇭🇹','Curaçao':'🇨🇼','Cape Verde':'🇨🇻',
  'DR Congo':'🇨🇩','Congo DR':'🇨🇩',
}

async function apiRequest(endpoint) {
  const res = await fetch(`https://api.football-data.org/v4${endpoint}`, {
    headers: { 'X-Auth-Token': FOOTBALL_API_KEY },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

function mapStatus(status) {
  if (status === 'FINISHED') return 'finished'
  if (status === 'IN_PLAY' || status === 'PAUSED') return 'live'
  return 'upcoming'
}

function mapStage(stage) {
  if (stage === 'GROUP_STAGE') return 'Grupos'
  if (stage === 'ROUND_OF_16') return 'Oitavas'
  if (stage === 'QUARTER_FINALS') return 'Quartas'
  if (stage === 'SEMI_FINALS') return 'Semis'
  if (stage === 'THIRD_PLACE') return '3º Lugar'
  if (stage === 'FINAL') return 'Final'
  return stage || 'Grupos'
}

function mapGroup(group) {
  if (!group) return null
  return group.replace('GROUP_', 'Grupo ')
}

// ── 1. JOGOS ────────────────────────────────────────────────────────────────
async function syncMatches() {
  console.log('📅 Sincronizando jogos...')
  const data = await apiRequest('/competitions/WC/matches?season=2026')
  const matches = data.matches || []

  let salvos = 0, pulados = 0, erros = 0

  for (const match of matches) {
    if (!match.homeTeam?.name || !match.awayTeam?.name) { pulados++; continue }

    // Montar objeto base — nunca sobrescrever placar manual com null
    const matchData = {
      external_id: String(match.id),
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
      home_flag: FLAG_MAP[match.homeTeam.name] || '🏳️',
      away_flag: FLAG_MAP[match.awayTeam.name] || '🏳️',
      home_shield: match.homeTeam.crest || null,
      away_shield: match.awayTeam.crest || null,
      match_date: new Date(match.utcDate).toISOString(),
      stage: mapStage(match.stage),
      group_name: mapGroup(match.group),
      status: mapStatus(match.status),
      stream_url: 'https://www.youtube.com/@CazeTV',
    }
    // Só atualiza placar se a API retornou valor real
    const apiHomeScore = match.score?.fullTime?.home
    const apiAwayScore = match.score?.fullTime?.away
    if (apiHomeScore !== null && apiHomeScore !== undefined) matchData.home_score = apiHomeScore
    if (apiAwayScore !== null && apiAwayScore !== undefined) matchData.away_score = apiAwayScore

    const { error } = await supabase.from('matches').upsert(matchData, { onConflict: 'external_id' })

    if (error) { console.error(`⚠️ Jogo ${match.id}: ${error.message}`); erros++ }
    else salvos++
  }
  console.log(`✅ Jogos: ${salvos} salvos | ⏭️ ${pulados} pulados | ❌ ${erros} erros`)
}

// ── 2. CLASSIFICAÇÃO DOS GRUPOS ─────────────────────────────────────────────
async function syncStandings() {
  console.log('📊 Sincronizando classificação...')
  const data = await apiRequest('/competitions/WC/standings?season=2026')
  const standings = data.standings || []

  if (standings.length === 0) { console.log('⚠️ Sem standings ainda.'); return }

  // Verificar se a API já retornou grupos separados (GROUP_A, GROUP_B...)
  const temGruposSeparados = standings.some(s => s.group && s.group.match(/GROUP_[A-Z]/))
  if (!temGruposSeparados) {
    console.log('⚠️ API ainda não separou por grupos — pulando standings.')
    return
  }

  let salvos = 0, erros = 0

  for (const group of standings) {
    const groupName = group.group?.replace('GROUP_', 'Grupo ') || 'Grupos'
    for (const entry of group.table) {
      const { error } = await supabase.from('group_standings').upsert({
        group_name: groupName,
        team_name: entry.team.name,
        flag_emoji: FLAG_MAP[entry.team.name] || '🏳️',
        played: entry.playedGames,
        won: entry.won,
        drawn: entry.draw,
        lost: entry.lost,
        goals_for: entry.goalsFor,
        goals_against: entry.goalsAgainst,
        goal_diff: entry.goalDifference,
        points: entry.points,
      }, { onConflict: 'group_name,team_name' })

      if (error) { console.error(`⚠️ ${entry.team.name}: ${error.message}`); erros++ }
      else salvos++
    }
  }
  console.log(`✅ Standings: ${salvos} salvos | ❌ ${erros} erros`)
}

// ── 3. ARTILHEIROS ──────────────────────────────────────────────────────────
async function syncScorers() {
  console.log('⚽ Sincronizando artilheiros...')
  const res = await fetch('https://free-api-live-football-data.p.rapidapi.com/football-get-top-players-by-goals?leagueid=47', {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
      'Content-Type': 'application/json',
    }
  })
  const json = await res.json()
  const scorers = json?.response?.players || json?.response || []

  if (!scorers.length) { console.log('⚠️ Sem artilheiros ainda.'); return }

  await supabase.from('top_scorers').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  let salvos = 0
  for (const s of scorers.slice(0, 20)) {
    const player = s.player || s
    const team = s.team || s.statistics?.[0]?.team || {}
    const goals = s.goals?.total || s.statistics?.[0]?.goals?.total || s.goals || 0
    const assists = s.goals?.assists || s.statistics?.[0]?.goals?.assists || s.assists || 0

    const { error } = await supabase.from('top_scorers').insert({
      player_name: player.name || player.firstname + ' ' + player.lastname,
      team_name: team.name || '',
      flag_emoji: FLAG_MAP[team.name] || '🏳️',
      goals,
      assists,
      photo_url: player.photo || null,
    })
    if (!error) salvos++
    else console.error('scorer error:', error.message)
  }
  console.log(`✅ Artilheiros: ${salvos} salvos`)
}

// ── 4. ASSISTÊNCIAS ─────────────────────────────────────────────────────────
async function syncAssists() {
  console.log('👟 Sincronizando assistências...')
  const res = await fetch('https://free-api-live-football-data.p.rapidapi.com/football-get-top-players-by-assists?leagueid=47', {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
      'Content-Type': 'application/json',
    }
  })
  const json = await res.json()
  const players = json?.response?.players || json?.response || []

  const withAssists = players.filter(s => {
    const a = s.goals?.assists || s.statistics?.[0]?.goals?.assists || s.assists || 0
    return a > 0
  }).slice(0, 20)

  if (!withAssists.length) { console.log('⚠️ Sem assistências ainda.'); return }

  await supabase.from('top_assists').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  let salvos = 0
  for (const s of withAssists) {
    const player = s.player || s
    const team = s.team || s.statistics?.[0]?.team || {}
    const assists = s.goals?.assists || s.statistics?.[0]?.goals?.assists || s.assists || 0
    const goals = s.goals?.total || s.statistics?.[0]?.goals?.total || s.goals || 0

    const { error } = await supabase.from('top_assists').insert({
      player_name: player.name || player.firstname + ' ' + player.lastname,
      team_name: team.name || '',
      flag_emoji: FLAG_MAP[team.name] || '🏳️',
      assists,
      goals,
      photo_url: player.photo || null,
    })
    if (!error) salvos++
    else console.error('assist error:', error.message)
  }
  console.log(`✅ Assistências: ${salvos} salvos`)
}

// ── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  try {
    await syncMatches()
    await syncStandings()
    await syncScorers()
    await syncAssists()
    console.log('🏆 Sincronização completa!')
  } catch (err) {
    console.error('❌ ERRO:', err.message)
    process.exit(1)
  }
}

main()
