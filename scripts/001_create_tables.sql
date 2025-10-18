-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  total_points integer default 0,
  created_at timestamp with time zone default now()
);

-- Create game_sessions table to track game plays
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  game_type text not null check (game_type in ('impostor', 'spin', 'quiz')),
  points_earned integer default 0,
  game_data jsonb,
  created_at timestamp with time zone default now()
);

-- Create leaderboard view
create or replace view public.leaderboard as
select 
  p.id,
  p.username,
  p.avatar_url,
  p.total_points,
  count(gs.id) as games_played
from public.profiles p
left join public.game_sessions gs on p.id = gs.user_id
group by p.id, p.username, p.avatar_url, p.total_points
order by p.total_points desc
limit 100;

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.game_sessions enable row level security;

-- Profiles policies
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Game sessions policies
create policy "game_sessions_select_own"
  on public.game_sessions for select
  using (auth.uid() = user_id);

create policy "game_sessions_insert_own"
  on public.game_sessions for insert
  with check (auth.uid() = user_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
