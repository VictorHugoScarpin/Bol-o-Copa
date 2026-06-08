import { createClient } from '@supabase/supabase-js';

// Inicialização explícita para evitar o erro de WebSocket no ambiente GitHub
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: { enabled: false }
  }
);

async function sync() {
  console.log("🚀 A iniciar sincronização...");
  
  // URL da API para a época 2022 (Teste de prova real)
  const url = 'https://v3.football.api-sports.io/fixtures?league=1&season=2022';
  const res = await fetch(url, {
    headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
  });
  
  const data = await res.json();
  
  if (!data.response || data.response.length === 0) {
    throw new Error("A API respondeu, mas não encontrou jogos.");
  }

  console.log(`📡 Recebidos ${data.response.length} jogos. A gravar...`);

  for (const f of data.response.slice(0, 5)) {
    const { error } = await supabase.from('matches').upsert({
      external_id: String(f.fixture.id),
      home_team: f.teams.home.name,
      away_team: f.teams.away.name,
      match_date: f.fixture.date,
      status: 'upcoming'
    }, { onConflict: 'external_id' });
    
    if (error) throw new Error("Erro ao gravar no Supabase: " + error.message);
  }
  
  console.log("✅ Sync concluído com sucesso!");
}

sync().catch(err => {
  console.error("❌ ERRO:", err.message);
  process.exit(1);
});
