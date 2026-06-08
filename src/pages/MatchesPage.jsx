import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Código ISO para flagcdn.com
const TEAM_ISO = {
  'Brazil': 'br', 'Argentina': 'ar', 'France': 'fr', 'Germany': 'de',
  'Spain': 'es', 'England': 'gb-eng', 'Portugal': 'pt', 'Netherlands': 'nl',
  'Italy': 'it', 'Uruguay': 'uy', 'Colombia': 'co', 'Mexico': 'mx',
  'United States': 'us', 'USA': 'us', 'Canada': 'ca', 'Japan': 'jp',
  'South Korea': 'kr', 'Korea Republic': 'kr', 'Morocco': 'ma',
  'Senegal': 'sn', 'Ghana': 'gh', 'Nigeria': 'ng', 'Australia': 'au',
  'Saudi Arabia': 'sa', 'Iran': 'ir', 'IR Iran': 'ir', 'Qatar': 'qa',
  'Croatia': 'hr', 'Serbia': 'rs', 'Switzerland': 'ch', 'Belgium': 'be',
  'Denmark': 'dk', 'Poland': 'pl', 'Cameroon': 'cm', 'Ecuador': 'ec',
  'Tunisia': 'tn', 'Costa Rica': 'cr', 'Wales': 'gb-wls',
  'Chile': 'cl', 'Peru': 'pe', 'Paraguay': 'py', 'Venezuela': 've',
  'Bolivia': 'bo', 'Austria': 'at', 'Turkey': 'tr', 'Ukraine': 'ua',
  'Honduras': 'hn', 'Panama': 'pa', 'Jamaica': 'jm',
  'Slovakia': 'sk', 'Romania': 'ro', 'Hungary': 'hu',
  'Czechia': 'cz', 'Czech Republic': 'cz', 'Slovenia': 'si',
  'Algeria': 'dz', 'Egypt': 'eg', 'New Zealand': 'nz',
  "Côte d'Ivoire": 'ci', 'Ivory Coast': 'ci',
  'Guatemala': 'gt', 'El Salvador': 'sv',
  'South Africa': 'za', 'Kenya': 'ke', 'Tanzania': 'tz',
  'Cuba': 'cu', 'Trinidad and Tobago': 'tt',
  'Scotland': 'gb-sct', 'Northern Ireland': 'gb-nir',
  'Greece': 'gr', 'Norway': 'no', 'Sweden': 'se', 'Finland': 'fi',
  'Russia': 'ru', 'Belarus': 'by', 'Georgia': 'ge', 'Armenia': 'am',
  'Albania': 'al', 'Kosovo': 'xk', 'North Macedonia': 'mk',
  'Bosnia and Herzegovina': 'ba', 'Montenegro': 'me',
  'Israel': 'il', 'Lebanon': 'lb', 'Iraq': 'iq', 'Syria': 'sy',
  'Jordan': 'jo', 'Kuwait': 'kw', 'Oman': 'om', 'Bahrain': 'bh',
  'UAE': 'ae', 'United Arab Emirates': 'ae', 'Yemen': 'ye',
  'Uzbekistan': 'uz', 'Kazakhstan': 'kz', 'Kyrgyzstan': 'kg',
  'Thailand': 'th', 'Vietnam': 'vn', 'Indonesia': 'id',
  'Philippines': 'ph', 'Malaysia': 'my', 'Singapore': 'sg',
  'China': 'cn', 'India': 'in', 'Pakistan': 'pk', 'Bangladesh': 'bd',
  'Mozambique': 'mz', 'Angola': 'ao', 'Zambia': 'zm', 'Zimbabwe': 'zw',
  'Uganda': 'ug', 'Ethiopia': 'et', 'Mali': 'ml', 'Burkina Faso': 'bf',
  'Guinea': 'gn', 'Togo': 'tg', 'Benin': 'bj', 'Madagascar': 'mg',
}

const TEAM_PT = {
  'Brazil': 'Brasil', 'Argentina': 'Argentina', 'France': 'França',
  'Germany': 'Alemanha', 'Spain': 'Espanha', 'England': 'Inglaterra',
  'Portugal': 'Portugal', 'Netherlands': 'Holanda', 'Italy': 'Itália',
  'Uruguay': 'Uruguai', 'Colombia': 'Colômbia', 'Mexico': 'México',
  'United States': 'EUA', 'USA': 'EUA', 'Canada': 'Canadá',
  'Japan': 'Japão', 'South Korea': 'Coreia do Sul', 'Korea Republic': 'Coreia do Sul',
  'Morocco': 'Marrocos', 'Senegal': 'Senegal', 'Ghana': 'Gana',
  'Nigeria': 'Nigéria', 'Australia': 'Austrália', 'Saudi Arabia': 'Arábia Saudita',
  'Iran': 'Irã', 'IR Iran': 'Irã', 'Qatar': 'Catar', 'Croatia': 'Croácia',
  'Serbia': 'Sérvia', 'Switzerland': 'Suíça', 'Belgium': 'Bélgica',
  'Denmark': 'Dinamarca', 'Poland': 'Polônia', 'Cameroon': 'Camarões',
  'Ecuador': 'Equador', 'Tunisia': 'Tunísia', 'Costa Rica': 'Costa Rica',
  'Wales': 'País de Gales', 'Chile': 'Chile', 'Peru': 'Peru',
  'Paraguay': 'Paraguai', 'Venezuela': 'Venezuela', 'Bolivia': 'Bolívia',
  'Austria': 'Áustria', 'Turkey': 'Turquia', 'Ukraine': 'Ucrânia',
  'Honduras': 'Honduras', 'Panama': 'Panamá', 'Jamaica': 'Jamaica',
  'Slovakia': 'Eslováquia', 'Romania': 'Romênia', 'Hungary': 'Hungria',
  'Czechia': 'República Tcheca', 'Czech Republic': 'República Tcheca',
  'Slovenia': 'Eslovênia', 'Algeria': 'Argélia', 'Egypt': 'Egito',
  'New Zealand': 'Nova Zelândia', "Côte d'Ivoire": 'Costa do Marfim',
  'Ivory Coast': 'Costa do Marfim', 'Guatemala': 'Guatemala',
  'El Salvador': 'El Salvador', 'South Africa': 'África do Sul',
  'Scotland': 'Escócia', 'Northern Ireland': 'Irlanda do Norte',
  'Greece': 'Grécia', 'Norway': 'Noruega', 'Sweden': 'Suécia',
  'Finland': 'Finlândia', 'Russia': 'Rússia', 'Georgia': 'Geórgia',
  'Albania': 'Albânia', 'North Macedonia': 'Macedônia do Norte',
  'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
  'Israel': 'Israel', 'United Arab Emirates': 'Emirados Árabes',
  'UAE': 'Emirados Árabes', 'China': 'China', 'India': 'Índia',
  'Thailand': 'Tailândia', 'Indonesia': 'Indonésia',
}

// Escudos via Wikipedia (os mais comuns da Copa 2026)
const TEAM_SHIELD = {
  'Brazil': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/CBF_logo.svg/200px-CBF_logo.svg.png',
  'Argentina': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/AFA_logo.svg/200px-AFA_logo.svg.png',
  'France': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/FFF_logo_2022.svg/200px-FFF_logo_2022.svg.png',
  'Germany': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/DFB-Logo_2024.svg/200px-DFB-Logo_2024.svg.png',
  'Spain': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/RFEF2021.svg/200px-RFEF2021.svg.png',
  'England': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Three_Lions_on_a_shield.svg/200px-Three_Lions_on_a_shield.svg.png',
  'Portugal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/FPF_logo_2022.svg/200px-FPF_logo_2022.svg.png',
  'Netherlands': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/KNVB_logo.svg/200px-KNVB_logo.svg.png',
  'Italy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FIGC_logo_2023.svg/200px-FIGC_logo_2023.svg.png',
  'Uruguay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Escudo_de_la_AUF.svg/200px-Escudo_de_la_AUF.svg.png',
  'Colombia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Federaci%C3%B3n_Colombiana_de_F%C3%BAtbol_logo.svg/200px-Federaci%C3%B3n_Colombiana_de_F%C3%BAtbol_logo.svg.png',
  'Mexico': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/FMF_logo.svg/200px-FMF_logo.svg.png',
  'United States': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/USSF_logo.svg/200px-USSF_logo.svg.png',
  'USA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/USSF_logo.svg/200px-USSF_logo.svg.png',
  'Canada': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Canada_Soccer_Logo.svg/200px-Canada_Soccer_Logo.svg.png',
  'Japan': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Japan_Football_Association_logo.svg/200px-Japan_Football_Association_logo.svg.png',
  'South Korea': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Korea_Football_Association.svg/200px-Korea_Football_Association.svg.png',
  'Korea Republic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Korea_Football_Association.svg/200px-Korea_Football_Association.svg.png',
  'Morocco': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/FRMF_logo.svg/200px-FRMF_logo.svg.png',
  'Senegal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/FSF_logo.svg/200px-FSF_logo.svg.png',
  'Australia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Football_Federation_Australia_logo.svg/200px-Football_Federation_Australia_svg.png',
  'Croatia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/HNS_logo.svg/200px-HNS_logo.svg.png',
  'Switzerland': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/ASF_logo.svg/200px-ASF_logo.svg.png',
  'Denmark': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/DBU_logo.svg/200px-DBU_logo.svg.png',
  'Poland': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/PZPN_logo.svg/200px-PZPN_logo.svg.png',
  'Ecuador': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Federaci%C3%B3n_Ecuatoriana_de_F%C3%BAtbol_logo.svg/200px-Federaci%C3%B3n_Ecuatoriana_de_F%C3%BAtbol_logo.svg.png',
  'Saudi Arabia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Saudi_Football_Federation_Logo.svg/200px-Saudi_Football_Federation_Logo.svg.png',
  'Iran': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Football_Federation_IR_Iran.svg/200px-Football_Federation_IR_Iran.svg.png',
  'IR Iran': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Football_Federation_IR_Iran.svg/200px-Football_Federation_IR_Iran.svg.png',
  'Qatar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/QFA_logo.svg/200px-QFA_logo.svg.png',
  'Serbia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Football_Association_of_Serbia_logo.svg/200px-Football_Association_of_Serbia_logo.svg.png',
  'Belgium': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Royal_Belgian_Football_Association_logo.svg/200px-Royal_Belgian_Football_Association_logo.svg.png',
  'Cameroon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/FECAFOOT.svg/200px-FECAFOOT.svg.png',
  'Tunisia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/FTF_logo.svg/200px-FTF_logo.svg.png',
  'Costa Rica': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/FEDEFUTBOL_logo.svg/200px-FEDEFUTBOL_logo.svg.png',
  'Wales': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/FAW_logo.svg/200px-FAW_logo.svg.png',
  'Ghana': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/GFA_logo.svg/200px-GFA_logo.svg.png',
  'Nigeria': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/NFF_logo.svg/200px-NFF_logo.svg.png',
  'Chile': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/ANFP_logo.svg/200px-ANFP_logo.svg.png',
  'Peru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/FPF_escudo.svg/200px-FPF_escudo.svg.png',
  'Paraguay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/APF_logo.svg/200px-APF_logo.svg.png',
  'Czechia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Football_Association_of_Czech_Republic_logo.svg/200px-Football_Association_of_Czech_Republic_logo.svg.png',
  'Slovakia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/SFZ_logo.svg/200px-SFZ_logo.svg.png',
  'Hungary': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/MLSZ_logo.svg/200px-MLSZ_logo.svg.png',
  'Romania': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/FRF_logo.svg/200px-FRF_logo.svg.png',
  'Slovenia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/NZS_logo.svg/200px-NZS_logo.svg.png',
  'Algeria': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/FAF_logo.svg/200px-FAF_logo.svg.png',
  'Egypt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/EFA_logo.svg/200px-EFA_logo.svg.png',
  'Honduras': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/FENAFUTH_logo.svg/200px-FENAFUTH_logo.svg.png',
  'Panama': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/FEPAFUT_logo.svg/200px-FEPAFUT_logo.svg.png',
  'Jamaica': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Jamaica_Football_Federation_logo.svg/200px-Jamaica_Football_Federation_logo.svg.png',
}

function getFlagUrl(name) {
  const iso = TEAM_ISO[name]
  return iso ? `https://flagcdn.com/w160/${iso}.png` : null
}

function getShieldUrl(name) {
  return TEAM_SHIELD[name] || null
}

function getPT(name) {
  return TEAM_PT[name] || name
}

// Bolinha: bandeira como foto + escudo de fundo
function TeamCircle({ name, size = 44 }) {
  const flagUrl = getFlagUrl(name)
  const shieldUrl = getShieldUrl(name)

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '1.5px solid rgba(255,255,255,0.15)',
      background: '#0d1117',
    }}>
      {/* Escudo de fundo */}
      {shieldUrl && (
        <img
          src={shieldUrl}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'contain',
            opacity: 0.2,
            filter: 'blur(0.5px)',
            padding: '3px',
          }}
          onError={e => { e.target.style.display = 'none' }}
        />
      )}
      {/* Bandeira na frente */}
      {flagUrl ? (
        <img
          src={flagUrl}
          alt={name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.92,
          }}
          onError={e => { e.target.style.display = 'none' }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.5,
        }}>
          🏳️
        </div>
      )}
    </div>
  )
}

function FlagBg({ name, side }) {
  const flagUrl = getFlagUrl(name)
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
      {flagUrl && (
        <img
          src={flagUrl}
          alt=""
          style={{
            position: 'absolute', top: '50%', [side]: '-5%',
            transform: 'translateY(-50%)',
            width: '130%', height: '130%',
            objectFit: 'cover',
            opacity: 0.07,
            filter: 'saturate(1.8) blur(1px)',
          }}
        />
      )}
    </div>
  )
}

function MatchCard({ match }) {
  const finished = match.status === 'finished'
  const live = match.status === 'live'
  const homePT = getPT(match.home_team)
  const awayPT = getPT(match.away_team)

  return (
    <div style={{
      position: 'relative',
      background: live ? 'rgba(239,68,68,0.06)' : 'var(--bg-glass)',
      border: `1px solid ${live ? 'rgba(239,68,68,0.3)' : 'var(--border-glass)'}`,
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: '14px 16px',
    }}>
      <FlagBg name={match.home_team} side="left" />
      <FlagBg name={match.away_team} side="right" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className="badge badge-muted">
            {match.stage}{match.group_name ? ` · ${match.group_name}` : ''}
          </span>
          {live && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--red)', fontWeight: 700 }}>
              <div className="live-dot" />AO VIVO
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Time da casa */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <TeamCircle name={match.home_team} size={44} />
            <span style={{ fontSize: '12px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
              {homePT}
            </span>
          </div>

          {/* Placar / Horário */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {finished
              ? <div style={{ fontFamily: 'var(--font-display)', fontSize: '30px', letterSpacing: '0.04em', lineHeight: 1 }}>
                  {match.home_score} <span style={{ color: 'var(--text-muted)', fontSize: '20px' }}>×</span> {match.away_score}
                </div>
              : <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.06em' }}>
                  {format(parseISO(match.match_date), 'HH:mm')}
                </div>
            }
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {format(parseISO(match.match_date), 'dd/MM')}
            </div>
          </div>

          {/* Time de fora */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <TeamCircle name={match.away_team} size={44} />
            <span style={{ fontSize: '12px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
              {awayPT}
            </span>
          </div>
        </div>

        {live && match.stream_url && (
          <a href={match.stream_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', padding: '8px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--red)', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
            📺 Assistir na CazéTV
          </a>
        )}
      </div>
    </div>
  )
}

function StatsTab() {
  const [scorers, setScorers] = useState([])
  const [assists, setAssists] = useState([])
  const [statsTab, setStatsTab] = useState('scorers')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('top_scorers').select('*').order('goals', { ascending: false }).limit(10),
      supabase.from('top_assists').select('*').order('assists', { ascending: false }).limit(10),
    ]).then(([s, a]) => {
      setScorers(s.data || [])
      setAssists(a.data || [])
      setLoading(false)
    })
  }, [])

  const data = statsTab === 'scorers' ? scorers : assists
  const key = statsTab === 'scorers' ? 'goals' : 'assists'
  const label = statsTab === 'scorers' ? 'gols' : 'assist.'
  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '16px' }}>
        {[['scorers', '⚽ Artilheiros'], ['assists', '👟 Assistências']].map(([k, l]) => (
          <button key={k} onClick={() => setStatsTab(k)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, background: statsTab === k ? 'rgba(255,255,255,0.1)' : 'transparent', color: statsTab === k ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {l}
          </button>
        ))}
      </div>
      {loading
        ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 10 }} />)
        : data.length === 0
          ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '14px' }}>Disponível após o início da Copa.</div>
          : data.map((p, i) => (
            <div key={p.id} className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: 24, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '16px', color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)', flexShrink: 0 }}>{i < 3 ? MEDALS[i] : `${i + 1}º`}</div>
              {p.photo_url
                ? <img src={p.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{p.flag_emoji || '⚽'}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.flag_emoji} {p.team_name}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-primary)', letterSpacing: '0.04em', lineHeight: 1 }}>{p[key]}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
              </div>
            </div>
          ))
      }
    </div>
  )
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('jogos')

  useEffect(() => {
    supabase.from('matches').select('*').order('match_date').then(({ data }) => {
      setMatches(data || [])
      setLoading(false)
    })
  }, [])

  const grouped = {}
  matches.forEach(m => {
    const d = format(parseISO(m.match_date), "EEEE, dd 'de' MMMM", { locale: ptBR })
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(m)
  })

  return (
    <div className="page">
      <div className="section-title">Jogos</div>

      <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '16px', gap: '4px' }}>
        {[['jogos', '📅 Jogos'], ['stats', '⚽ Artilheiros']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'stats' ? <StatsTab /> : (
        loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 140, marginBottom: 12 }} />)
          : matches.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>Nenhum jogo cadastrado ainda.</div>
            : Object.entries(grouped).map(([date, dayMatches]) => (
              <div key={date}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '10px', marginTop: '20px' }}>{date}</div>
                <div className="matches-grid">
                  {dayMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </div>
            ))
      )}
    </div>
  )
}
