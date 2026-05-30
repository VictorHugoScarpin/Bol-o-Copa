import { useState } from 'react'

const VENUES = [
  {
    id: 1, city: 'Nova York / Nova Jersey', country: 'EUA',
    x: 72, y: 32,
    stadium: 'MetLife Stadium',
    matches: ['Grupo A · 13/Jun', 'Grupo C · 17/Jun', 'Quartas · 04/Jul', 'FINAL · 19/Jul']
  },
  {
    id: 2, city: 'Los Angeles', country: 'EUA',
    x: 16, y: 42,
    stadium: 'SoFi Stadium',
    matches: ['Grupo B · 14/Jun', 'Grupo D · 18/Jun', 'Oitavas · 01/Jul', 'Semis · 14/Jul']
  },
  {
    id: 3, city: 'Dallas', country: 'EUA',
    x: 42, y: 52,
    stadium: 'AT&T Stadium',
    matches: ['Grupo E · 15/Jun', 'Grupo F · 19/Jun', 'Oitavas · 02/Jul']
  },
  {
    id: 4, city: 'San Francisco', country: 'EUA',
    x: 11, y: 36,
    stadium: "Levi's Stadium",
    matches: ['Grupo G · 16/Jun', 'Grupo H · 20/Jun', 'Quartas · 05/Jul']
  },
  {
    id: 5, city: 'Miami', country: 'EUA',
    x: 65, y: 60,
    stadium: 'Hard Rock Stadium',
    matches: ['Grupo I · 15/Jun', 'Grupo J · 19/Jun', 'Oitavas · 03/Jul']
  },
  {
    id: 6, city: 'Seattle', country: 'EUA',
    x: 13, y: 22,
    stadium: 'Lumen Field',
    matches: ['Grupo K · 14/Jun', 'Grupo L · 18/Jun']
  },
  {
    id: 7, city: 'Boston', country: 'EUA',
    x: 75, y: 27,
    stadium: 'Gillette Stadium',
    matches: ['Grupo A · 16/Jun', 'Grupo C · 20/Jun', 'Oitavas · 04/Jul']
  },
  {
    id: 8, city: 'Atlanta', country: 'EUA',
    x: 62, y: 50,
    stadium: 'Mercedes-Benz Stadium',
    matches: ['Grupo B · 17/Jun', 'Grupo D · 21/Jun', 'Semis · 15/Jul']
  },
  {
    id: 9, city: 'Cidade do México', country: 'México',
    x: 33, y: 65,
    stadium: 'Estadio Azteca',
    matches: ['Jogo Abertura · 11/Jun', 'Grupo M · 15/Jun', 'Grupo N · 19/Jun', 'Quartas · 06/Jul']
  },
  {
    id: 10, city: 'Guadalajara', country: 'México',
    x: 28, y: 63,
    stadium: 'Estadio Akron',
    matches: ['Grupo O · 16/Jun', 'Grupo P · 20/Jun']
  },
  {
    id: 11, city: 'Monterrey', country: 'México',
    x: 37, y: 60,
    stadium: 'Estadio BBVA',
    matches: ['Grupo Q · 17/Jun', 'Grupo R · 21/Jun', 'Oitavas · 05/Jul']
  },
  {
    id: 12, city: 'Toronto', country: 'Canadá',
    x: 66, y: 24,
    stadium: 'BMO Field',
    matches: ['Grupo S · 13/Jun', 'Grupo T · 17/Jun', 'Oitavas · 06/Jul']
  },
  {
    id: 13, city: 'Vancouver', country: 'Canadá',
    x: 14, y: 18,
    stadium: 'BC Place',
    matches: ['Grupo U · 14/Jun', 'Grupo V · 18/Jun']
  },
  {
    id: 14, city: 'Kansas City', country: 'EUA',
    x: 50, y: 38,
    stadium: 'Arrowhead Stadium',
    matches: ['Grupo W · 16/Jun', 'Grupo X · 20/Jun']
  },
  {
    id: 15, city: 'Filadélfia', country: 'EUA',
    x: 71, y: 34,
    stadium: 'Lincoln Financial Field',
    matches: ['Grupo Y · 15/Jun', 'Grupo Z · 19/Jun', 'Quartas · 07/Jul']
  },
  {
    id: 16, city: 'Houston', country: 'EUA',
    x: 46, y: 58,
    stadium: 'NRG Stadium',
    matches: ['Grupo A2 · 16/Jun', 'Grupo B2 · 20/Jun']
  },
]

const COUNTRY_COLOR = { 'EUA': '#3b82f6', 'Canadá': '#ef4444', 'México': '#22c55e' }

// SVG path simplificado do contorno de EUA + Canadá + México
const MAP_PATH = `
M 5,15 L 18,12 L 22,8 L 35,7 L 50,6 L 62,8 L 72,10 L 80,15 L 82,20
L 80,25 L 78,28 L 76,26 L 74,28 L 78,30 L 80,35 L 78,38 L 75,36
L 72,38 L 70,36 L 68,40 L 65,42 L 60,44 L 56,48 L 55,52 L 58,54
L 62,52 L 65,56 L 68,58 L 66,62 L 62,65 L 58,68 L 52,70 L 48,72
L 42,72 L 38,70 L 34,68 L 30,66 L 26,64 L 24,60 L 22,58 L 20,56
L 16,55 L 12,52 L 10,48 L 8,44 L 6,40 L 4,36 L 3,30 L 3,24 L 5,18 Z
M 52,70 L 55,72 L 58,75 L 56,78 L 52,80 L 48,80 L 44,78 L 42,74 L 44,72 L 48,72 Z
`

export default function MapPage() {
  const [active, setActive] = useState(null)
  const [hovered, setHovered] = useState(null)

  const current = hovered || active

  return (
    <div className="page">
      <div className="section-title">Sedes da Copa</div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Passe o mouse (ou toque) nas cidades para ver os jogos de cada sede.
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {Object.entries(COUNTRY_COLOR).map(([country, color]) => (
          <div key={country} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{country}</span>
          </div>
        ))}
      </div>

      {/* Mapa */}
      <div className="glass-card" style={{ padding: '8px', marginBottom: '16px', position: 'relative' }}>
        <svg
          viewBox="0 0 90 85"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Contorno dos países */}
          <path d={MAP_PATH} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />

          {/* Linhas de grade sutis */}
          {[20,40,60].map(x => <line key={x} x1={x} y1="0" x2={x} y2="85" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />)}
          {[20,40,60].map(y => <line key={y} x1="0" y1={y} x2="90" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />)}

          {/* Cidades */}
          {VENUES.map(v => {
            const color = COUNTRY_COLOR[v.country] || '#fff'
            const isActive = current?.id === v.id
            return (
              <g key={v.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(v)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setActive(active?.id === v.id ? null : v)}
              >
                {/* Anel externo quando ativo */}
                {isActive && (
                  <circle cx={v.x} cy={v.y} r="3.5" fill="none" stroke={color} strokeWidth="0.6" opacity="0.5" />
                )}
                {/* Ponto principal */}
                <circle
                  cx={v.x} cy={v.y} r={isActive ? 2.2 : 1.6}
                  fill={color}
                  opacity={isActive ? 1 : 0.75}
                  style={{ transition: 'all 0.2s' }}
                />
                {/* Pulso para cidade com final/semis */}
                {(v.matches.some(m => m.includes('FINAL') || m.includes('Semis'))) && (
                  <circle cx={v.x} cy={v.y} r="3" fill="none" stroke={color} strokeWidth="0.4" opacity="0.3">
                    <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Info box */}
      {current ? (
        <div className="glass-card" style={{ padding: '16px 20px', border: `1px solid ${COUNTRY_COLOR[current.country]}44`, animation: 'fadeUp 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>{current.city}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{current.stadium} · {current.country}</div>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: COUNTRY_COLOR[current.country], marginTop: '6px', flexShrink: 0 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {current.matches.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                <span style={{ color: m.includes('FINAL') ? 'var(--accent-gold)' : m.includes('Semis') || m.includes('Quartas') ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: m.includes('FINAL') ? 700 : 400 }}>
                  {m.includes('FINAL') ? '🏆' : m.includes('Semis') ? '⚔️' : m.includes('Quartas') ? '🔥' : m.includes('Oitavas') ? '⚡' : '⚽'} {m}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '16px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>👆 Clique em uma cidade no mapa para ver os jogos</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {VENUES.length} sedes · 3 países · 1 Copa
          </div>
        </div>
      )}
    </div>
  )
}
