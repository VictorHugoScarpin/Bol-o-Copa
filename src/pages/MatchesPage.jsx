import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── ISO para bandeiras (flagcdn.com) ─────────────────────────────
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
  'South Africa': 'za',
  'Bosnia and Herzegovina': 'ba', 'Bosnia & Herzegovina': 'ba',
  'Haiti': 'ht', 'Curaçao': 'cw', 'Curacao': 'cw',
  'Cape Verde': 'cv', 'Cape Verde Islands': 'cv',
  'Congo DR': 'cd', 'DR Congo': 'cd',
  'Scotland': 'gb-sct', 'Northern Ireland': 'gb-nir', 'Ireland': 'ie',
  'Greece': 'gr', 'Norway': 'no', 'Sweden': 'se', 'Finland': 'fi',
  'Albania': 'al', 'North Macedonia': 'mk', 'Montenegro': 'me',
  'Georgia': 'ge', 'Kosovo': 'xk',
  'Trinidad and Tobago': 'tt', 'Cuba': 'cu', 'Nicaragua': 'ni',
  'Suriname': 'sr', 'Guyana': 'gy',
  'Kenya': 'ke', 'Tanzania': 'tz', 'Uganda': 'ug', 'Mali': 'ml',
  'Mozambique': 'mz', 'Angola': 'ao', 'Zambia': 'zm', 'Zimbabwe': 'zw',
  'Togo': 'tg', 'Benin': 'bj', 'Guinea': 'gn', 'Burkina Faso': 'bf',
  'Ethiopia': 'et', 'Namibia': 'na', 'Mauritania': 'mr',
  'Thailand': 'th', 'Vietnam': 'vn', 'Indonesia': 'id',
  'Philippines': 'ph', 'Malaysia': 'my', 'China': 'cn',
  'India': 'in', 'Uzbekistan': 'uz', 'Kazakhstan': 'kz',
  'Iraq': 'iq', 'Jordan': 'jo', 'United Arab Emirates': 'ae', 'UAE': 'ae',
  'Oman': 'om', 'Kuwait': 'kw', 'Bahrain': 'bh',
}

// ── Nomes em português ────────────────────────────────────────────
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
  'Czechia': 'Rep. Tcheca', 'Czech Republic': 'Rep. Tcheca',
  'Slovenia': 'Eslovênia', 'Algeria': 'Argélia', 'Egypt': 'Egito',
  'New Zealand': 'Nova Zelândia', "Côte d'Ivoire": 'Costa do Marfim',
  'Ivory Coast': 'Costa do Marfim', 'Guatemala': 'Guatemala',
  'El Salvador': 'El Salvador', 'South Africa': 'África do Sul',
  'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
  'Bosnia & Herzegovina': 'Bósnia e Herzegovina',
  'Haiti': 'Haiti', 'Curaçao': 'Curaçao', 'Curacao': 'Curaçao',
  'Cape Verde': 'Cabo Verde', 'Cape Verde Islands': 'Cabo Verde',
  'Congo DR': 'Congo RD', 'DR Congo': 'Congo RD',
  'Scotland': 'Escócia', 'Northern Ireland': 'Irlanda do Norte',
  'Ireland': 'Irlanda', 'Greece': 'Grécia', 'Norway': 'Noruega',
  'Sweden': 'Suécia', 'Finland': 'Finlândia', 'Albania': 'Albânia',
  'North Macedonia': 'Macedônia do Norte', 'Montenegro': 'Montenegro',
  'Georgia': 'Geórgia', 'Kosovo': 'Kosovo',
  'Trinidad and Tobago': 'Trinidad e Tobago', 'Cuba': 'Cuba',
  'United Arab Emirates': 'Emirados Árabes', 'UAE': 'Emirados Árabes',
  'Iraq': 'Iraque', 'Jordan': 'Jordânia', 'Uzbekistan': 'Uzbequistão',
}

// ── Escudos das federações ────────────────────────────────────────
const TEAM_SHIELD = {
  'Brazil':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Brazilian_Football_Confederation_logo.svg/200px-Brazilian_Football_Confederation_logo.svg.png',
  'Argentina':              'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Afa_logo.svg/200px-Afa_logo.svg.png',
  'France':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/France_national_football_team_seal.png/200px-France_national_football_team_seal.png',
  'Germany':                'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/DFBEagle.png/200px-DFBEagle.png',
  'Spain':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Spain_National_Football_Team_badge.png/200px-Spain_National_Football_Team_badge.png',
  'England':                'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Arms_of_The_Football_Association_%28include_star%29.svg/200px-Arms_of_The_Football_Association_%28include_star%29.svg.png',
  'Portugal':               'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Portugal_FPF.png/200px-Portugal_FPF.png',
  'Netherlands':            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Netherlands_national_football_team_logo_2017.png/200px-Netherlands_national_football_team_logo_2017.png',
  'United States':          'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/United_States_Soccer_Federation_logo.svg/200px-United_States_Soccer_Federation_logo.svg.png',
  'USA':                    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/United_States_Soccer_Federation_logo.svg/200px-United_States_Soccer_Federation_logo.svg.png',
  'Canada':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Logotipo_Sele%C3%A7%C3%A3o_Canad%C3%A1.png/200px-Logotipo_Sele%C3%A7%C3%A3o_Canad%C3%A1.png',
  'Mexico':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mexico_national_football_team_crest_%282022%29.png/200px-Mexico_national_football_team_crest_%282022%29.png',
  'Colombia':               'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/FCF-Logo-2023.svg/200px-FCF-Logo-2023.svg.png',
  'Ecuador':                'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Logo_de_la_Federaci%C3%B3n_Ecuatoriana_de_F%C3%BAtbol_%282%29.svg/200px-Logo_de_la_Federaci%C3%B3n_Ecuatoriana_de_F%C3%BAtbol_%282%29.svg.png',
  'Paraguay':               'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Asociaci%C3%B3n_Paraguaya_de_F%C3%BAtbol_logo.svg/200px-Asociaci%C3%B3n_Paraguaya_de_F%C3%BAtbol_logo.svg.png',
  'Uruguay':                'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/AUF.png/200px-AUF.png',
  'Austria':                'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/OFB.png/200px-OFB.png',
  'Belgium':                'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Royal_Belgian_FA_logo_2019.png/200px-Royal_Belgian_FA_logo_2019.png',
  'Bosnia and Herzegovina': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png/200px-Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png',
  'Bosnia & Herzegovina':   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png/200px-Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png',
  'Croatia':                'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Croatia_football_federation.png/200px-Croatia_football_federation.png',
  'Scotland':               'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sele%C3%A7%C3%A3o_Escocesa_logo.png/200px-Sele%C3%A7%C3%A3o_Escocesa_logo.png',
  'Switzerland':            'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/SFV_Logo.svg.png/200px-SFV_Logo.svg.png',
  'Turkey':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Roundel_flag_of_Turkey.svg/200px-Roundel_flag_of_Turkey.svg.png',
  'Norway':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sele%C3%A7%C3%A3o_Norueguesa_de_Futebol_Logo.png/200px-Sele%C3%A7%C3%A3o_Norueguesa_de_Futebol_Logo.png',
  'Czechia':                'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/FACR.png/200px-FACR.png',
  'Czech Republic':         'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/FACR.png/200px-FACR.png',
  'Sweden':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/SFSverige.png/200px-SFSverige.png',
  'South Africa':           'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/SAFA_logo.svg/200px-SAFA_logo.svg.png',
  'Algeria':                'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Algeria_National_Football_Team_logo.png/200px-Algeria_National_Football_Team_logo.png',
  'Cape Verde':             'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Federa%C3%A7%C3%A3o_Cabo-Verdiana_de_Futebol.png/200px-Federa%C3%A7%C3%A3o_Cabo-Verdiana_de_Futebol.png',
  'Cape Verde Islands':     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Federa%C3%A7%C3%A3o_Cabo-Verdiana_de_Futebol.png/200px-Federa%C3%A7%C3%A3o_Cabo-Verdiana_de_Futebol.png',
  "Côte d'Ivoire":          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png/200px-F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png',
  'Ivory Coast':            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png/200px-F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png',
  'Egypt':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Egyptian_Football_Association.png/200px-Egyptian_Football_Association.png',
  'Ghana':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ghana_Football_Association.png/200px-Ghana_Football_Association.png',
  'Morocco':                'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/F%C3%A9d%C3%A9ration_Royale_Marocaine_de_Football.png/200px-F%C3%A9d%C3%A9ration_Royale_Marocaine_de_Football.png',
  'Congo DR':               'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/F%C3%A9d%C3%A9ration_Congolaise_de_Football_Association.png/200px-F%C3%A9d%C3%A9ration_Congolaise_de_Football_Association.png',
  'DR Congo':               'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/F%C3%A9d%C3%A9ration_Congolaise_de_Football_Association.png/200px-F%C3%A9d%C3%A9ration_Congolaise_de_Football_Association.png',
  'Senegal':                'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/FSenegalaiseF.png/200px-FSenegalaiseF.png',
  'Tunisia':                'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/F%C3%A9d%C3%A9ration_Tunisienne_de_Football.png/200px-F%C3%A9d%C3%A9ration_Tunisienne_de_Football.png',
  'Nigeria':                'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/NFF_logo.svg/200px-NFF_logo.svg.png',
  'Cameroon':               'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/FECAFOOT.svg/200px-FECAFOOT.svg.png',
  'Saudi Arabia':           'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/SAFF.png/200px-SAFF.png',
  'Australia':              'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Australia_national_football_team_badge.svg/200px-Australia_national_football_team_badge.svg.png',
  'Qatar':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Associa%C3%A7%C3%A3o_do_Qatar_de_Futebol.png/200px-Associa%C3%A7%C3%A3o_do_Qatar_de_Futebol.png',
  'South Korea':            'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/South_Korea_national_football_team_logo.png/200px-South_Korea_national_football_team_logo.png',
  'Korea Republic':         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/South_Korea_national_football_team_logo.png/200px-South_Korea_national_football_team_logo.png',
  'Iran':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Football_Federation_Islamic_Republic_of_Iran.png/200px-Football_Federation_Islamic_Republic_of_Iran.png',
  'IR Iran':                'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Football_Federation_Islamic_Republic_of_Iran.png/200px-Football_Federation_Islamic_Republic_of_Iran.png',
  'Iraq':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Iraq_National_Team_Badge_2021_v2.svg/200px-Iraq_National_Team_Badge_2021_v2.svg.png',
  'Japan':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/JapanFA.png/200px-JapanFA.png',
  'Jordan':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Jordan_Football_Association.png/200px-Jordan_Football_Association.png',
  'Uzbekistan':             'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Uzbekistan_Football_Federation.png/200px-Uzbekistan_Football_Federation.png',
  'Curaçao':                'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Federashon_Futb%C3%B2l_K%C3%B2rsou.png/200px-Federashon_Futb%C3%B2l_K%C3%B2rsou.png',
  'Curacao':                'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Federashon_Futb%C3%B2l_K%C3%B2rsou.png/200px-Federashon_Futb%C3%B2l_K%C3%B2rsou.png',
  'Haiti':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Federation_Haitienne_de_Football.png/200px-Federation_Haitienne_de_Football.png',
  'Panama':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Panama_FA_2.svg.png/200px-Panama_FA_2.svg.png',
  'Denmark':                'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/DBU_logo.svg/200px-DBU_logo.svg.png',
  'Poland':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/PZPN_logo.svg/200px-PZPN_logo.svg.png',
  'Serbia':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Football_Association_of_Serbia_logo.svg/200px-Football_Association_of_Serbia_logo.svg.png',
  'Chile':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/ANFP_logo.svg/200px-ANFP_logo.svg.png',
  'Peru':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/FPF_escudo.svg/200px-FPF_escudo.svg.png',
  'Slovakia':               'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/SFZ_logo.svg/200px-SFZ_logo.svg.png',
  'Hungary':                'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/MLSZ_logo.svg/200px-MLSZ_logo.svg.png',
  'Romania':                'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/FRF_logo.svg/200px-FRF_logo.svg.png',
  'Honduras':               'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/FENAFUTH_logo.svg/200px-FENAFUTH_logo.svg.png',
  'Costa Rica':             'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/FEDEFUTBOL_logo.svg/200px-FEDEFUTBOL_logo.svg.png',
  'Wales':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/FAW_logo.svg/200px-FAW_logo.svg.png',
}

function getFlagUrl(name) {
  const iso = TEAM_ISO[name]
  return iso ? `https://flagcdn.com/w160/${iso}.png` : null
}
function getShield(name) { return TEAM_SHIELD[name] || null }
function getPT(name) { return TEAM_PT[name] || name }

// ── Bolinha: bandeira na frente + escudo de fundo ─────────────────
function TeamCircle({ name, size = 46 }) {
  const flagUrl = getFlagUrl(name)
  const shieldUrl = getShield(name)

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '1.5px solid rgba(255,255,255,0.10)',
      background: '#0c1524',
    }}>
      {shieldUrl && (
        <img src={shieldUrl} alt="" style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'contain', opacity: 0.25, padding: '3px',
        }} onError={e => { e.target.style.display = 'none' }} />
      )}
      {flagUrl ? (
        <img src={flagUrl} alt={name} style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.88,
        }} onError={e => { e.target.style.display = 'none' }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.42,
        }}>🏳️</div>
      )}
    </div>
  )
}

// ── Fundo do card: escudo grande com opacidade baixa ─────────────
function CardBg({ name, side }) {
  const shieldUrl = getShield(name)
  const flagUrl = getFlagUrl(name)
  const url = shieldUrl || flagUrl

  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, [side]: 0,
      width: '52%', overflow: 'hidden', pointerEvents: 'none',
    }}>
      {url && (
        <img src={url} alt="" style={{
          position: 'absolute',
          top: '50%', [side]: shieldUrl ? '6%' : '-8%',
          transform: 'translateY(-50%)',
          width: shieldUrl ? '68%' : '130%',
          height: shieldUrl ? '68%' : '130%',
          objectFit: shieldUrl ? 'contain' : 'cover',
          opacity: shieldUrl ? 0.11 : 0.06,
          filter: shieldUrl ? 'none' : 'saturate(1.4) blur(1px)',
        }} onError={e => { e.target.style.display = 'none' }} />
      )}
    </div>
  )
}

// ── Card de jogo ──────────────────────────────────────────────────
function MatchCard({ match }) {
  const finished = match.status === 'finished'
  const live = match.status === 'live'

  const borderColor = live
    ? 'rgba(232,69,69,0.35)'
    : finished
      ? 'rgba(232,184,75,0.18)'
      : 'rgba(255,255,255,0.07)'

  const bgColor = live
    ? 'rgba(232,69,69,0.05)'
    : 'var(--deep)'

  return (
    <div style={{
      position: 'relative',
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Borda esquerda colorida por status */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: live
          ? 'var(--red)'
          : finished
            ? 'var(--gold)'
            : 'transparent',
        borderRadius: '3px 0 0 3px',
      }} />

      <CardBg name={match.home_team} side="left" />
      <CardBg name={match.away_team} side="right" />

      <div style={{ position: 'relative', zIndex: 1, padding: '12px 14px 12px 17px' }}>
        {/* Topo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{
            fontSize: '9px', fontWeight: 700,
            color: 'rgba(221,230,245,0.30)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {match.stage}{match.group_name ? ` · ${match.group_name}` : ''}
          </span>
          {live && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '9px', color: 'var(--red)', fontWeight: 700, letterSpacing: '0.07em',
            }}>
              <div className="live-dot" /> AO VIVO
            </span>
          )}
          {finished && (
            <span style={{ fontSize: '9px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Encerrado
            </span>
          )}
        </div>

        {/* Times + placar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Casa */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <TeamCircle name={match.home_team} size={46} />
            <span style={{
              fontSize: '11px', fontWeight: 600, textAlign: 'center',
              lineHeight: 1.2, color: 'var(--text)', maxWidth: '78px',
            }}>
              {getPT(match.home_team)}
            </span>
          </div>

          {/* Centro */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '2px',
            flexShrink: 0, minWidth: '68px',
          }}>
            {finished || live ? (
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '34px', letterSpacing: '0.02em', lineHeight: 1,
                color: live ? 'var(--red)' : 'var(--text)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {match.home_score ?? 0}
                <span style={{ color: 'rgba(221,230,245,0.2)', margin: '0 3px', fontSize: '22px' }}>–</span>
                {match.away_score ?? 0}
              </div>
            ) : (
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px', letterSpacing: '0.02em', lineHeight: 1,
                color: 'var(--gold-bright)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {format(parseISO(match.match_date), 'HH:mm')}
              </div>
            )}
            <div style={{
              fontSize: '10px', color: 'var(--text-3)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {format(parseISO(match.match_date), 'dd/MM')}
            </div>
          </div>

          {/* Fora */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <TeamCircle name={match.away_team} size={46} />
            <span style={{
              fontSize: '11px', fontWeight: 600, textAlign: 'center',
              lineHeight: 1.2, color: 'var(--text)', maxWidth: '78px',
            }}>
              {getPT(match.away_team)}
            </span>
          </div>
        </div>

        {/* Link ao vivo */}
        {live && match.stream_url && (
          <a href={match.stream_url} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            marginTop: '10px', padding: '7px', borderRadius: '10px',
            background: 'rgba(232,69,69,0.12)', border: '1px solid rgba(232,69,69,0.25)',
            color: 'var(--red)', fontSize: '11px', fontWeight: 700,
            textDecoration: 'none', letterSpacing: '0.04em',
          }}>
            📺 Assistir na CazéTV
          </a>
        )}
      </div>
    </div>
  )
}

// ── Filtro por tab de dia ─────────────────────────────────────────
function getTabMatches(matches, tab) {
  const todayStart = startOfDay(new Date())
  const todayEnd   = new Date(todayStart.getTime() + 86400000)
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  if (tab === 'ontem')   return matches.filter(m => { const d = parseISO(m.match_date); return d >= yesterdayStart && d < todayStart })
  if (tab === 'hoje')    return matches.filter(m => { const d = parseISO(m.match_date); return d >= todayStart && d < todayEnd })
  if (tab === 'proximos') return matches.filter(m => parseISO(m.match_date) >= todayEnd)
  return []
}

// ── Stats Tab ─────────────────────────────────────────────────────
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

  const data  = statsTab === 'scorers' ? scorers : assists
  const key   = statsTab === 'scorers' ? 'goals' : 'assists'
  const label = statsTab === 'scorers' ? 'gols' : 'assist.'
  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '10px', padding: '4px', marginBottom: '16px' }}>
        {[['scorers', '⚽ Artilheiros'], ['assists', '👟 Assistências']].map(([k, l]) => (
          <button key={k} onClick={() => setStatsTab(k)} style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            background: statsTab === k ? 'rgba(255,255,255,0.09)' : 'transparent',
            color: statsTab === k ? 'var(--text)' : 'var(--text-3)',
          }}>{l}</button>
        ))}
      </div>

      {loading
        ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)
        : data.length === 0
          ? <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: '14px' }}>Disponível após o início da Copa.</div>
          : data.map((p, i) => (
            <div key={p.id} className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: 24, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '16px', color: i < 3 ? 'var(--gold)' : 'var(--text-3)', flexShrink: 0 }}>
                {i < 3 ? MEDALS[i] : `${i + 1}º`}
              </div>
              {p.photo_url
                ? <img src={p.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{p.flag_emoji || '⚽'}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{p.flag_emoji} {p.team_name}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>{p[key]}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase' }}>{label}</div>
              </div>
            </div>
          ))
      }
    </div>
  )
}

// ── Page principal ────────────────────────────────────────────────
export default function MatchesPage() {
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('jogos')
  const [dayTab, setDayTab]     = useState('hoje')

  useEffect(() => {
    supabase.from('matches').select('*').order('match_date').then(({ data }) => {
      const all = data || []
      setMatches(all)
      setLoading(false)
      if (getTabMatches(all, 'hoje').length === 0) setDayTab('proximos')
    })
  }, [])

  const tabMatches = useMemo(() => getTabMatches(matches, dayTab), [matches, dayTab])

  const grouped = useMemo(() => {
    const g = {}
    tabMatches.forEach(m => {
      const d = format(parseISO(m.match_date), "EEE., dd 'de' MMM.", { locale: ptBR })
      if (!g[d]) g[d] = []
      g[d].push(m)
    })
    return g
  }, [tabMatches])

  return (
    <div className="page">
      {/* Tabs principais */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '10px', padding: '4px', marginBottom: '16px', gap: '4px' }}>
        {[['jogos', '⚽ Jogos'], ['stats', '📊 Artilheiros']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            background: tab === k ? 'rgba(255,255,255,0.09)' : 'transparent',
            color: tab === k ? 'var(--text)' : 'var(--text-3)',
            transition: 'all 0.18s',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'stats' ? <StatsTab /> : (
        <>
          {/* Tabs Ontem / Hoje / Próximos */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--rim)', marginBottom: '20px' }}>
            {[['ontem', 'Ontem'], ['hoje', 'Hoje'], ['proximos', 'Próximos']].map(([k, l]) => (
              <button key={k} onClick={() => setDayTab(k)} style={{
                flex: 1, padding: '10px 6px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                background: 'transparent',
                color: dayTab === k ? 'var(--text)' : 'var(--text-3)',
                borderBottom: `2px solid ${dayTab === k ? 'var(--gold)' : 'transparent'}`,
                transition: 'all 0.18s',
                marginBottom: '-1px',
              }}>{l}</button>
            ))}
          </div>

          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120, marginBottom: 10, borderRadius: 16 }} />
            ))
            : tabMatches.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚽</div>
                  <div style={{ color: 'var(--text-3)', fontSize: '14px' }}>
                    {dayTab === 'ontem' ? 'Nenhum jogo ontem.' : dayTab === 'hoje' ? 'Nenhum jogo hoje.' : 'Nenhum jogo futuro.'}
                  </div>
                </div>
              )
              : Object.entries(grouped).map(([date, dayMatches]) => (
                <div key={date} style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '10px', fontWeight: 700,
                    color: 'var(--gold)',
                    textTransform: 'capitalize', letterSpacing: '0.1em',
                    marginBottom: '10px', paddingLeft: '2px',
                  }}>
                    {date}
                  </div>
                  <div className="matches-grid">
                    {dayMatches.map(m => <MatchCard key={m.id} match={m} />)}
                  </div>
                </div>
              ))
          }
        </>
      )}
    </div>
  )
}
