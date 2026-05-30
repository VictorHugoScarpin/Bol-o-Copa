-- Execute no Supabase SQL Editor

create table if not exists master_guess (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null unique,
  team1 text not null,
  team2 text not null,
  points_earned int default 0,
  created_at timestamptz default now()
);

alter table master_guess enable row level security;

create policy "Usuário vê próprio palpite mestre"
  on master_guess for select to authenticated using (auth.uid() = user_id);

create policy "Usuário insere próprio palpite mestre"
  on master_guess for insert to authenticated with check (auth.uid() = user_id);

create policy "Usuário edita próprio palpite mestre"
  on master_guess for update to authenticated using (auth.uid() = user_id);
