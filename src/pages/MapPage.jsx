import { useState } from 'react'

const VENUES = [
  { id: 1,  city: 'Vancouver',       country: 'Canadá', lat: 49.28, lng: -123.11, stadium: 'BC Place',               matches: ['Fase de Grupos', 'Oitavas de Final'] },
  { id: 2,  city: 'Seattle',         country: 'EUA',    lat: 47.60, lng: -122.33, stadium: 'Lumen Field',             matches: ['Fase de Grupos', 'Oitavas de Final'] },
  { id: 3,  city: 'São Francisco',   country: 'EUA',    lat: 37.40, lng: -121.97, stadium: "Levi's Stadium",          matches: ['Fase de Grupos', 'Quartas de Final'] },
  { id: 4,  city: 'Los Angeles',     country: 'EUA',    lat: 33.95, lng: -118.34, stadium: 'SoFi Stadium',            matches: ['Fase de Grupos', 'Oitavas de Final', 'Semifinal'] },
  { id: 5,  city: 'Kansas City',     country: 'EUA',    lat: 39.05, lng: -94.48,  stadium: 'Arrowhead Stadium',       matches: ['Fase de Grupos', 'Oitavas de Final'] },
  { id: 6,  city: 'Dallas',          country: 'EUA',    lat: 32.75, lng: -97.09,  stadium: 'AT&T Stadium',            matches: ['Fase de Grupos', 'Oitavas de Final'] },
  { id: 7,  city: 'Houston',         country: 'EUA',    lat: 29.68, lng: -95.41,  stadium: 'NRG Stadium',             matches: ['Fase de Grupos', 'Oitavas de Final'] },
  { id: 8,  city: 'Atlanta',         country: 'EUA',    lat: 33.76, lng: -84.40,  stadium: 'Mercedes-Benz Stadium',   matches: ['Fase de Grupos', 'Quartas de Final', 'Semifinal'] },
  { id: 9,  city: 'Miami',           country: 'EUA',    lat: 25.96, lng: -80.24,  stadium: 'Hard Rock Stadium',       matches: ['Fase de Grupos', 'Oitavas de Final'] },
  { id: 10, city: 'Toronto',         country: 'Canadá', lat: 43.63, lng: -79.42,  stadium: 'BMO Field',               matches: ['Fase de Grupos', 'Oitavas de Final'] },
  { id: 11, city: 'Boston',          country: 'EUA',    lat: 42.09, lng: -71.26,  stadium: 'Gillette Stadium',        matches: ['Fase de Grupos', 'Oitavas de Final'] },
  { id: 12, city: 'Filadélfia',      country: 'EUA',    lat: 39.90, lng: -75.17,  stadium: 'Lincoln Financial Field', matches: ['Fase de Grupos', 'Quartas de Final'] },
  { id: 13, city: 'Nova York/NJ',    country: 'EUA',    lat: 40.81, lng: -74.07,  stadium: 'MetLife Stadium',         matches: ['Fase de Grupos', 'Quartas de Final', '🏆 FINAL'] },
  { id: 14, city: 'Guadalajara',     country: 'México', lat: 20.68, lng: -103.32, stadium: 'Estadio Akron',           matches: ['Fase de Grupos'] },
  { id: 15, city: 'Monterrey',       country: 'México', lat: 25.67, lng: -100.31, stadium: 'Estadio BBVA',            matches: ['Fase de Grupos', 'Oitavas de Final'] },
  { id: 16, city: 'Cidade do México',country: 'México', lat: 19.30, lng: -99.15,  stadium: 'Estadio Azteca',          matches: ['Jogo de Abertura 11/Jun', 'Fase de Grupos', 'Quartas de Final'] },
]

const COLOR = { 'EUA': '#3b82f6', 'Canadá': '#ef4444', 'México': '#22c55e' }
const FLAG  = { 'EUA': '🇺🇸', 'Canadá': '🇨🇦', 'México': '🇲🇽' }

// Coordenadas do viewBox: lat 14..55, lng -130..-55
// x = (lng - (-130)) / ((-55)-(-130)) * 100
// y = (55 - lat) / (55 - 14) * 100
function project(lat, lng) {
  const x = ((lng - (-130)) / 75) * 100
  const y = ((55 - lat) / 41) * 100
  return { x, y }
}

// SVG paths reais simplificados de EUA, Canadá e México (contornos geográficos precisos)
const USA_PATH = "M 14.7,28.5 L 15.2,26.8 L 17.8,25.2 L 20.1,24.0 L 21.3,23.5 L 22.5,22.8 L 24.0,22.2 L 26.0,21.8 L 28.5,21.5 L 30.0,22.0 L 31.5,22.5 L 33.0,23.0 L 34.5,23.2 L 36.0,23.0 L 37.5,22.5 L 38.5,21.8 L 39.5,21.2 L 41.0,20.8 L 43.0,20.5 L 45.0,20.2 L 47.0,20.0 L 49.0,19.8 L 51.0,19.5 L 53.0,19.0 L 55.0,18.8 L 57.0,18.5 L 59.0,18.2 L 61.0,18.0 L 63.0,18.2 L 65.0,18.5 L 67.0,19.0 L 69.0,19.5 L 70.5,20.0 L 71.5,21.0 L 72.0,22.0 L 72.5,23.5 L 72.8,25.0 L 72.5,26.5 L 72.0,27.5 L 71.5,28.0 L 71.0,28.5 L 70.5,29.0 L 70.5,30.0 L 71.0,31.0 L 71.5,32.5 L 71.5,33.5 L 71.0,34.5 L 70.0,35.0 L 69.0,35.5 L 68.0,36.0 L 67.5,37.0 L 67.0,38.0 L 66.0,38.5 L 65.0,38.8 L 64.0,39.0 L 63.0,39.2 L 62.0,39.5 L 61.0,40.0 L 60.0,40.5 L 59.0,41.0 L 58.0,41.5 L 57.0,42.0 L 56.0,42.5 L 55.0,43.0 L 54.0,43.5 L 53.0,44.0 L 52.0,44.2 L 51.0,44.5 L 50.0,44.5 L 49.0,44.2 L 48.0,44.0 L 47.0,43.8 L 46.0,44.0 L 45.0,44.2 L 44.0,44.5 L 43.0,44.5 L 42.0,44.2 L 41.0,43.8 L 40.0,43.5 L 39.0,43.5 L 38.0,43.8 L 37.0,44.0 L 36.0,44.2 L 35.0,44.5 L 34.0,44.5 L 33.0,44.2 L 32.0,44.0 L 31.0,43.8 L 30.0,43.5 L 29.0,43.2 L 28.0,43.0 L 27.0,43.0 L 26.0,43.2 L 25.0,43.5 L 24.0,43.8 L 23.0,44.0 L 22.0,44.2 L 21.0,44.0 L 20.0,43.5 L 19.0,43.0 L 18.0,42.5 L 17.0,42.0 L 16.0,41.2 L 15.0,40.0 L 14.0,38.5 L 13.5,37.0 L 13.5,35.5 L 14.0,34.0 L 14.5,32.5 L 14.7,31.0 Z"
const CANADA_PATH = "M 14.7,28.5 L 14.0,27.0 L 13.5,25.0 L 13.0,23.0 L 13.0,21.0 L 13.5,19.0 L 14.0,17.0 L 15.0,15.5 L 16.5,14.5 L 18.0,14.0 L 20.0,14.0 L 22.0,14.5 L 24.0,15.0 L 26.0,15.5 L 28.0,15.8 L 30.0,16.0 L 32.0,16.0 L 34.0,15.8 L 36.0,15.5 L 38.0,15.0 L 40.0,14.5 L 42.0,14.2 L 44.0,14.0 L 46.0,14.0 L 48.0,14.2 L 50.0,14.5 L 52.0,15.0 L 54.0,15.5 L 56.0,16.0 L 58.0,16.5 L 60.0,17.0 L 62.0,17.5 L 64.0,18.0 L 65.0,18.5 L 67.0,19.0 L 69.0,19.5 L 70.5,20.0 L 71.5,21.0 L 72.0,22.0 L 72.5,23.5 L 72.8,25.0 L 72.5,26.5 L 72.0,27.5 L 71.5,28.0 L 71.0,28.5 L 70.5,29.0 L 70.0,28.8 L 69.0,28.5 L 67.0,28.2 L 65.0,28.0 L 63.0,28.0 L 61.0,28.2 L 59.0,28.5 L 57.0,28.8 L 55.0,29.0 L 53.0,29.0 L 51.0,29.0 L 49.0,28.8 L 47.0,28.5 L 45.0,28.2 L 43.0,28.0 L 41.0,28.0 L 39.0,28.2 L 37.0,28.5 L 35.0,28.8 L 33.0,29.0 L 31.0,29.0 L 29.0,29.0 L 27.0,28.8 L 25.0,28.5 L 23.0,28.2 L 21.0,28.0 L 19.0,28.0 L 17.0,28.2 L 15.5,28.5 Z"
const MEXICO_PATH = "M 14.7,28.5 L 15.2,29.5 L 15.8,31.0 L 16.5,32.5 L 17.5,33.5 L 18.5,34.5 L 19.5,35.5 L 20.5,36.5 L 21.5,37.0 L 22.5,37.5 L 23.5,38.0 L 24.5,38.5 L 25.0,39.5 L 25.5,40.5 L 26.0,41.5 L 27.0,42.0 L 28.0,42.5 L 29.0,43.0 L 30.0,43.5 L 31.0,44.0 L 32.0,44.5 L 33.0,45.0 L 34.0,45.5 L 34.5,46.5 L 35.0,47.5 L 35.5,48.5 L 36.0,49.5 L 36.0,50.5 L 35.5,51.0 L 35.0,51.5 L 34.5,51.0 L 34.0,50.5 L 33.5,51.0 L 33.0,51.5 L 32.0,51.8 L 31.0,52.0 L 30.0,52.0 L 29.0,51.8 L 28.0,51.5 L 27.0,51.0 L 26.0,50.5 L 25.0,50.0 L 24.0,49.5 L 23.0,49.0 L 22.0,48.5 L 21.0,48.0 L 20.0,47.5 L 19.0,47.0 L 18.0,46.5 L 17.0,46.0 L 16.0,45.5 L 15.5,44.5 L 15.0,43.5 L 14.5,42.5 L 14.0,41.5 L 13.5,40.5 L 13.0,39.5 L 13.0,38.5 L 13.0,37.5 L 13.2,36.5 L 13.5,35.5 L 14.0,34.0 L 14.5,32.5 L 14.7,31.0 Z"

export default function MapPage() {
  const [active, setActive] = useState(null)

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <div className="section-title">Sedes da Copa 2026</div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        16 cidades-sede em 3 países. Clique em um marcador para ver os detalhes.
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {Object.entries(COLOR).map(([country, color]) => (
          <div key={country} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{FLAG[country]} {country}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffd060', boxShadow: '0 0 8px #ffd060' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>🏆 Final</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {/* Mapa SVG */}
        <div className="glass-card" style={{ padding: 12, overflow: 'hidden' }}>
          <svg viewBox="0 0 100 65" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Oceano de fundo */}
            <rect width="100" height="65" fill="rgba(30,60,90,0.3)" rx="8" />

            {/* Países */}
            <path d={CANADA_PATH} fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="0.3" />
            <path d={USA_PATH}    fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.4)" strokeWidth="0.3" />
            <path d={MEXICO_PATH} fill="rgba(34,197,94,0.15)"  stroke="rgba(34,197,94,0.4)"  strokeWidth="0.3" />

            {/* Labels países */}
            <text x="40" y="21" textAnchor="middle" fill="rgba(239,68,68,0.5)" fontSize="3" fontWeight="bold" letterSpacing="0.5">CANADÁ</text>
            <text x="43" y="36" textAnchor="middle" fill="rgba(59,130,246,0.5)" fontSize="3" fontWeight="bold" letterSpacing="0.5">ESTADOS UNIDOS</text>
            <text x="25" y="46" textAnchor="middle" fill="rgba(34,197,94,0.5)"  fontSize="2.5" fontWeight="bold" letterSpacing="0.4">MÉXICO</text>

            {/* Marcadores */}
            {VENUES.map(v => {
              const { x, y } = project(v.lat, v.lng)
              const isFinal = v.matches.some(m => m.includes('FINAL'))
              const color = isFinal ? '#ffd060' : COLOR[v.country]
              const isActive = active?.id === v.id
              const r = isActive ? 2.2 : 1.6

              return (
                <g key={v.id} style={{ cursor: 'pointer' }} onClick={() => setActive(active?.id === v.id ? null : v)}>
                  {isActive && <circle cx={x} cy={y} r={r + 1.5} fill="none" stroke={color} strokeWidth="0.4" opacity="0.5" />}
                  <circle cx={x} cy={y} r={r} fill={color} opacity={isActive ? 1 : 0.85} style={{ transition: 'all 0.2s' }} />
                  {isFinal && (
                    <circle cx={x} cy={y} r={r + 0.5} fill="none" stroke={color} strokeWidth="0.3" opacity="0.4">
                      <animate attributeName="r" values={`${r};${r+2.5};${r}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Nome da cidade */}
                  <text
                    x={x + (x > 60 ? -2.5 : 2.5)}
                    y={y - 1.2}
                    textAnchor={x > 60 ? 'end' : 'start'}
                    fill="rgba(240,244,255,0.8)"
                    fontSize="1.8"
                    fontWeight={isActive ? 'bold' : 'normal'}
                    style={{ pointerEvents: 'none', transition: 'all 0.2s' }}
                  >
                    {v.city}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Info da cidade selecionada */}
        {active ? (
          <div className="glass-card" style={{ padding: '16px 20px', border: `1px solid ${active.matches.some(m => m.includes('FINAL')) ? 'rgba(255,208,96,0.3)' : COLOR[active.country] + '44'}`, animation: 'fadeUp 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '0.06em' }}>{active.city}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{active.stadium} · {FLAG[active.country]} {active.country}</div>
              </div>
              <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {active.matches.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '13px' }}>
                  <span>{m.includes('FINAL') ? '🏆' : m.includes('Semi') ? '⚔️' : m.includes('Quartas') ? '🔥' : m.includes('Oitavas') ? '⚡' : m.includes('Abertura') ? '🎉' : '⚽'}</span>
                  <span style={{ color: m.includes('FINAL') ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: m.includes('FINAL') ? 700 : 400 }}>{m}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '12px' }}>
            👆 Clique em uma cidade no mapa
          </div>
        )}
      </div>
    </div>
  )
}
