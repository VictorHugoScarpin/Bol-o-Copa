import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const TEAM_PT = {
  'Brazil':'Brasil','Argentina':'Argentina','France':'França','Germany':'Alemanha',
  'Spain':'Espanha','England':'Inglaterra','Portugal':'Portugal','Netherlands':'Holanda',
  'Italy':'Itália','Uruguay':'Uruguai','Colombia':'Colômbia','Mexico':'México',
  'United States':'EUA','USA':'EUA','Canada':'Canadá','Japan':'Japão',
  'South Korea':'Coreia do Sul','Korea Republic':'Coreia do Sul','Morocco':'Marrocos',
  'Senegal':'Senegal','Ghana':'Gana','Nigeria':'Nigéria','Australia':'Austrália',
  'Saudi Arabia':'Arábia Saudita','Iran':'Irã','IR Iran':'Irã','Qatar':'Catar',
  'Croatia':'Croácia','Serbia':'Sérvia','Switzerland':'Suíça','Belgium':'Bélgica',
  'Denmark':'Dinamarca','Poland':'Polônia','Cameroon':'Camarões','Ecuador':'Equador',
  'Tunisia':'Tunísia','Costa Rica':'Costa Rica','Wales':'País de Gales',
  'Chile':'Chile','Peru':'Peru','Paraguay':'Paraguai','Venezuela':'Venezuela',
  'Bolivia':'Bolívia','Austria':'Áustria','Turkey':'Turquia','Ukraine':'Ucrânia',
  'Honduras':'Honduras','Panama':'Panamá','Jamaica':'Jamaica',
  'Slovakia':'Eslováquia','Romania':'Romênia','Hungary':'Hungria',
  'Czechia':'Rep. Tcheca','Czech Republic':'Rep. Tcheca','Slovenia':'Eslovênia',
  'Algeria':'Argélia','Egypt':'Egito','New Zealand':'Nova Zelândia',
  "Côte d'Ivoire":'Costa do Marfim','Ivory Coast':'Costa do Marfim',
  'Guatemala':'Guatemala','El Salvador':'El Salvador','South Africa':'África do Sul',
  'Bosnia and Herzegovina':'Bósnia e Herzegovina','Bosnia & Herzegovina':'Bósnia e Herzegovina',
  'Bosnia-Herzegovina':'Bósnia e Herzegovina','Scotland':'Escócia',
  'Uzbekistan':'Uzbequistão','Jordan':'Jordânia','Iraq':'Iraque',
  'Haiti':'Haiti','Curaçao':'Curaçao','Cape Verde':'Cabo Verde','DR Congo':'Congo RD',
}

const FLAG_MAP = {
  'Brazil':'🇧🇷','Argentina':'🇦🇷','France':'🇫🇷','Germany':'🇩🇪','Spain':'🇪🇸',
  'England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal':'🇵🇹','Netherlands':'🇳🇱','Italy':'🇮🇹',
  'Uruguay':'🇺🇾','Colombia':'🇨🇴','Mexico':'🇲🇽','United States':'🇺🇸','USA':'🇺🇸',
  'Canada':'🇨🇦','Japan':'🇯🇵','South Korea':'🇰🇷','Korea Republic':'🇰🇷',
  'Morocco':'🇲🇦','Senegal':'🇸🇳','Ghana':'🇬🇭','Nigeria':'🇳🇬','Australia':'🇦🇺',
  'Saudi Arabia':'🇸🇦','Iran':'🇮🇷','IR Iran':'🇮🇷','Qatar':'🇶🇦','Croatia':'🇭🇷',
  'Serbia':'🇷🇸','Switzerland':'🇨🇭','Belgium':'🇧🇪','Denmark':'🇩🇰','Poland':'🇵🇱',
  'Cameroon':'🇨🇲','Ecuador':'🇪🇨','Tunisia':'🇹🇳','Costa Rica':'🇨🇷',
  'Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿','Chile':'🇨🇱','Peru':'🇵🇪','Paraguay':'🇵🇾',
  'Venezuela':'🇻🇪','Bolivia':'🇧🇴','Austria':'🇦🇹','Turkey':'🇹🇷','Ukraine':'🇺🇦',
  'Honduras':'🇭🇳','Panama':'🇵🇦','Jamaica':'🇯🇲','Slovakia':'🇸🇰','Romania':'🇷🇴',
  'Hungary':'🇭🇺','Czechia':'🇨🇿','Slovenia':'🇸🇮','Algeria':'🇩🇿','Egypt':'🇪🇬',
  "Côte d'Ivoire":'🇨🇮','Guatemala':'🇬🇹','El Salvador':'🇸🇻',
  'South Africa':'🇿🇦','Bosnia and Herzegovina':'🇧🇦','Bosnia-Herzegovina':'🇧🇦',
  'Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Uzbekistan':'🇺🇿','Jordan':'🇯🇴','Iraq':'🇮🇶',
  'Haiti':'🇭🇹','Curaçao':'🇨🇼','Cape Verde':'🇨🇻',
}

function getPT(n) { return TEAM_PT[n] || n }
function getFlag(n) { return FLAG_MAP[n] || '🏳️' }

export default function GroupsPage() {
  const [groups, setGroups] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('group_standings').select('*')
      .order('group_name').order('points', { ascending: false }).order('goal_diff', { ascending: false })
      .then(({ data }) => {
        const grouped = {}
        ;(data || []).forEach(row => {
          if (!grouped[row.group_name]) grouped[row.group_name] = []
          grouped[row.group_name].push(row)
        })
        setGroups(grouped)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="page">
      <div className="section-title">Grupos</div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 200, marginBottom: 16, borderRadius: 14 }} />
      ))}
    </div>
  )

  return (
    <div className="page">
      <div className="section-title">Fase de Grupos</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {Object.entries(groups).map(([groupName, teams]) => (
          <GroupCard key={groupName} groupName={groupName} teams={teams} />
        ))}
        {Object.keys(groups).length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '60px 0', fontSize: '14px' }}>
            Classificação ainda não disponível.
          </div>
        )}
      </div>
    </div>
  )
}

function GroupCard({ groupName, teams }) {
  const letra = groupName.replace(/^Grupo\s*/i, '').toUpperCase()
  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(232,184,75,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gold-dim)', border: '1px solid rgba(232,184,75,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold-bright)', letterSpacing: '0.06em' }}>{letra}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.08em', color: 'var(--gold)' }}>GRUPO {letra}</div>
      </div>

      {/* Cabeçalho colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 28px 28px 28px 28px 32px 36px', padding: '6px 16px', borderBottom: '1px solid var(--border)' }}>
        {['', 'GF', 'J', 'V', 'E', 'D', 'SG', 'PT'].map((h, i) => (
          <div key={i} style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
        ))}
      </div>

      {teams.map((team, idx) => (
        <TeamRow key={team.id} team={team} position={idx + 1} isQualified={idx < 2} isLast={idx === teams.length - 1} />
      ))}
    </div>
  )
}

function TeamRow({ team, position, isQualified, isLast }) {
  const flag = team.flag_emoji || getFlag(team.team_name)
  const namePT = getPT(team.team_name)
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 32px 28px 28px 28px 28px 32px 36px',
      padding: '9px 16px', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
      background: isQualified ? 'rgba(29,185,84,0.04)' : 'transparent', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isQualified
          ? <div style={{ width: 3, height: 22, borderRadius: 2, background: 'var(--green)', flexShrink: 0 }} />
          : <div style={{ width: 3, flexShrink: 0 }} />
        }
        <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
          {flag}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{namePT}</span>
      </div>
      {[team.goals_for, team.played, team.won, team.drawn, team.lost, team.goal_diff, team.points].map((val, i) => (
        <div key={i} style={{ textAlign: 'center', fontSize: '13px', color: i === 6 ? 'var(--text)' : 'var(--text-2)', fontWeight: i === 6 ? 700 : 400, fontFamily: i === 6 ? 'var(--font-display)' : 'var(--font-body)', letterSpacing: i === 6 ? '0.04em' : 0 }}>
          {val ?? '-'}
        </div>
      ))}
    </div>
  )
}
