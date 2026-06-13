import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

function Avatar({ profile, size = 28 }) {
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--border-strong)' }} />
  }
  const initials = (profile.display_name || profile.nick || '?').slice(0, 2).toUpperCase()
  const colors = ['#e8b84b', '#1db954', '#4d8ef0', '#f03e3e', '#a855f7']
  const color = colors[initials.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}1a`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, color, flexShrink: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
      {initials}
    </div>
  )
}

const COL = '38px'
const COLS = `28px 1fr ${COL} ${COL} ${COL} ${COL}`

function HeaderRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', padding: '7px 14px', borderBottom: '1px solid var(--border)' }}>
      <div style={hStyle}>#</div>
      <div style={{ ...hStyle, textAlign: 'left', paddingLeft: 8 }}>Jogador</div>
      <div style={hStyle}>PT</div>
      <div style={hStyle}>PE</div>
      <div style={hStyle}>PR</div>
      <div style={hStyle}>J</div>
    </div>
  )
}

const hStyle = { fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }

function PlayerRow({ profile, position, isMe, totalGuesses }) {
  const posColors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' }
  const posColor = posColors[position] || 'var(--text-3)'

  // Destaque das primeiras posições
  const isTop3 = position <= 3
  const bgColor = isMe
    ? 'rgba(232,184,75,0.06)'
    : isTop3
    ? `rgba(255,255,255,0.02)`
    : 'transparent'

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: COLS, alignItems: 'center',
      padding: '9px 14px',
      background: bgColor,
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      borderLeft: isMe ? '3px solid var(--gold)' : isTop3 ? `3px solid ${posColor}` : '3px solid transparent',
      transition: 'background 0.15s',
    }}>
      {/* Posição */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: posColor, textAlign: 'center', lineHeight: 1 }}>
        {position}
      </div>

      {/* Avatar + Nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, minWidth: 0 }}>
        <Avatar profile={profile} size={28} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--gold-bright)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.display_name || profile.nick}
          </div>
          {isMe && <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: 1 }}>você</div>}
        </div>
      </div>

      {/* PT — Pontos */}
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '17px', color: isTop3 ? posColor : 'var(--text)', letterSpacing: '0.02em', lineHeight: 1 }}>
        {profile.points ?? 0}
      </div>

      {/* PE — Placares Exatos */}
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>
        {profile.exact_hits ?? 0}
      </div>

      {/* PR — Parciais (resultados certos) */}
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>
        {profile.partial_hits ?? 0}
      </div>

      {/* J — Jogos palpitados */}
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)' }}>
        {totalGuesses ?? 0}
      </div>
    </div>
  )
}

export default function ClassificacaoPage() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState([])
  const [guessCounts, setGuessCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: profiles }, { data: guesses }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, nick, avatar_url, points, exact_hits, partial_hits, created_at')
          .order('points', { ascending: false })
          .order('exact_hits', { ascending: false })
          .order('partial_hits', { ascending: false })
          .order('created_at', { ascending: true }),
        supabase.from('guesses').select('user_id'),
      ])

      // Conta jogos palpitados por usuário
      const counts = {}
      ;(guesses || []).forEach(g => {
        counts[g.user_id] = (counts[g.user_id] || 0) + 1
      })

      setRanking(profiles || [])
      setGuessCounts(counts)
      setLoading(false)
    }

    fetchData()

    const channel = supabase.channel('classificacao')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const myPosition = ranking.findIndex(p => p.id === user?.id) + 1

  return (
    <div className="page">
      <div className="section-title">Classificação</div>

      {/* Legenda colunas */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { sig: 'PT', desc: 'Pontos totais' },
          { sig: 'PE', desc: 'Placar exato' },
          { sig: 'PR', desc: 'Resultado certo' },
          { sig: 'J',  desc: 'Jogos palpitados' },
        ].map(({ sig, desc }) => (
          <div key={sig} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>{sig}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{desc}</span>
          </div>
        ))}
      </div>

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 48, marginBottom: 4, borderRadius: 10 }} />
        ))
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <HeaderRow />
          {ranking.map((p, i) => (
            <PlayerRow
              key={p.id}
              profile={p}
              position={i + 1}
              isMe={p.id === user?.id}
              totalGuesses={guessCounts[p.id] || 0}
            />
          ))}
          {ranking.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: '13px' }}>
              Nenhum participante ainda.
            </div>
          )}
        </div>
      )}

      {/* Posição do usuário fixada */}
      {myPosition > 0 && !loading && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--gold-dim)', border: '1px solid rgba(232,184,75,0.22)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Sua posição atual</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)', letterSpacing: '0.06em' }}>{myPosition}º</span>
        </div>
      )}
    </div>
  )
}
