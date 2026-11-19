-- ====================================================================
-- 1. EXTENSIONS & STORAGE BUCKET
-- ====================================================================
create extension if not exists "uuid-ossp";

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  false,
  10485760,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- ====================================================================
-- 2. CORE TABLES & PROFILES
-- ====================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  nickname text,
  avatar_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  relationship_start_date date not null default '2024-01-01',
  user1_id uuid references auth.users(id) on delete set null,
  user2_id uuid references auth.users(id) on delete set null,
  user1_name text default 'Partner 1',
  user2_name text default 'Partner 2',
  theme_palette text default 'blush',
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

insert into public.app_settings (id, relationship_start_date)
values (1, '2024-01-01')
on conflict (id) do nothing;

create table if not exists public.timeline_moments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  caption text,
  photo_url text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ====================================================================
-- 3. LETTERS & CRYPTOGRAPHIC / RLS SCHEDULED LOCK
-- ====================================================================

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  recipient_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  theme text not null default 'classic',
  font_family text not null default 'handwriting',
  delivery_type text not null default 'instant' check (delivery_type in ('instant', 'scheduled', 'open_when')),
  open_when_category text,
  open_at timestamptz,
  is_opened boolean not null default false,
  opened_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.letter_contents (
  letter_id uuid primary key references public.letters(id) on delete cascade,
  content_html text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ====================================================================
-- 4. PHOTOS & GALLERY
-- ====================================================================

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  caption text,
  album text not null default 'Memories',
  taken_at date default current_date,
  width int,
  height int,
  size_bytes bigint not null default 0,
  blur_data_url text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ====================================================================
-- 5. GAMES & LEADERBOARDS
-- ====================================================================

create table if not exists public.jigsaw_records (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references public.photos(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  difficulty text not null check (difficulty in ('3x3', '4x4', '6x6', '8x8')),
  time_seconds numeric(7,2) not null,
  moves int not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.memory_match_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  difficulty text not null check (difficulty in ('4x3', '4x4', '6x4')),
  turns int not null,
  time_seconds numeric(7,2) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.realtime_games (
  id uuid primary key default gen_random_uuid(),
  game_type text not null check (game_type in ('tictactoe', 'connect4')),
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished', 'draw', 'abandoned')),
  player_x_id uuid references auth.users(id) on delete cascade,
  player_o_id uuid references auth.users(id) on delete cascade,
  current_turn_id uuid references auth.users(id) on delete set null,
  board_state jsonb not null default '[]'::jsonb,
  winner_id uuid references auth.users(id) on delete set null,
  last_move_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  target_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  options jsonb not null,
  correct_option_index int not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.quiz_questions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  selected_option_index int not null,
  is_correct boolean not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (question_id, user_id)
);

-- ====================================================================
-- 6. EXTRAS (BUCKET LIST & DAILY QUESTIONS)
-- ====================================================================

create table if not exists public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Date Ideas',
  is_completed boolean not null default false,
  completed_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.daily_questions (
  id uuid primary key default gen_random_uuid(),
  question_date date not null unique default current_date,
  question_text text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.daily_answers (
  id uuid primary key default gen_random_uuid(),
  daily_question_id uuid references public.daily_questions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  answer text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (daily_question_id, user_id)
);

-- ====================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.timeline_moments enable row level security;
alter table public.letters enable row level security;
alter table public.letter_contents enable row level security;
alter table public.photos enable row level security;
alter table public.jigsaw_records enable row level security;
alter table public.memory_match_records enable row level security;
alter table public.realtime_games enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.bucket_items enable row level security;
alter table public.daily_questions enable row level security;
alter table public.daily_answers enable row level security;

-- ====================================================================
-- 8. RLS POLICIES
-- ====================================================================

create policy "Authenticated users can view profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Authenticated couple can view settings"
  on public.app_settings for select to authenticated using (true);

create policy "Authenticated couple can update settings"
  on public.app_settings for update to authenticated using (true);

create policy "Authenticated couple can view timeline"
  on public.timeline_moments for select to authenticated using (true);

create policy "Authenticated couple can insert timeline moments"
  on public.timeline_moments for insert to authenticated with check (auth.uid() is not null);

create policy "Authenticated couple can update timeline moments"
  on public.timeline_moments for update to authenticated using (auth.uid() is not null);

create policy "Authenticated couple can delete timeline moments"
  on public.timeline_moments for delete to authenticated using (auth.uid() is not null);

create policy "Sender or recipient can view letter envelope"
  on public.letters for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can insert letters as sender"
  on public.letters for insert to authenticated
  with check (auth.uid() = sender_id);

create policy "Recipient can mark letter opened when unlocked"
  on public.letters for update to authenticated
  using (
    auth.uid() = sender_id
    or (
      auth.uid() = recipient_id
      and (open_at is null or open_at <= timezone('utc'::text, now()))
    )
  );

create policy "Sender or unlocked recipient can read letter contents"
  on public.letter_contents for select to authenticated
  using (
    exists (
      select 1 from public.letters
      where public.letters.id = public.letter_contents.letter_id
        and (
          public.letters.sender_id = auth.uid()
          or (
            public.letters.recipient_id = auth.uid()
            and (public.letters.open_at is null or public.letters.open_at <= timezone('utc'::text, now()))
          )
        )
    )
  );

create policy "Sender can insert letter contents"
  on public.letter_contents for insert to authenticated
  with check (
    exists (
      select 1 from public.letters
      where public.letters.id = public.letter_contents.letter_id
        and public.letters.sender_id = auth.uid()
    )
  );

create policy "Authenticated couple can view photos"
  on public.photos for select to authenticated using (true);

create policy "Authenticated couple can upload photos"
  on public.photos for insert to authenticated with check (auth.uid() is not null);

create policy "Authenticated couple can update photos"
  on public.photos for update to authenticated using (auth.uid() is not null);

create policy "Authenticated couple can delete photos"
  on public.photos for delete to authenticated using (auth.uid() is not null);

create policy "Authenticated couple can view jigsaw records"
  on public.jigsaw_records for select to authenticated using (true);

create policy "Authenticated couple can insert jigsaw records"
  on public.jigsaw_records for insert to authenticated with check (auth.uid() = user_id);

create policy "Authenticated couple can view memory records"
  on public.memory_match_records for select to authenticated using (true);

create policy "Authenticated couple can insert memory records"
  on public.memory_match_records for insert to authenticated with check (auth.uid() = user_id);

create policy "Authenticated couple can view realtime games"
  on public.realtime_games for select to authenticated using (true);

create policy "Authenticated couple can insert realtime games"
  on public.realtime_games for insert to authenticated with check (auth.uid() is not null);

create policy "Authenticated couple can update realtime games"
  on public.realtime_games for update to authenticated using (auth.uid() is not null);

create policy "Authenticated couple can view quiz questions"
  on public.quiz_questions for select to authenticated using (true);

create policy "Users can insert quiz questions"
  on public.quiz_questions for insert to authenticated with check (auth.uid() = author_id);

create policy "Users can view quiz answers"
  on public.quiz_answers for select to authenticated using (true);

create policy "Users can insert their quiz answers"
  on public.quiz_answers for insert to authenticated with check (auth.uid() = user_id);

create policy "Authenticated couple can view bucket list"
  on public.bucket_items for select to authenticated using (true);

create policy "Authenticated couple can insert bucket list items"
  on public.bucket_items for insert to authenticated with check (auth.uid() is not null);

create policy "Authenticated couple can update bucket list items"
  on public.bucket_items for update to authenticated using (auth.uid() is not null);

create policy "Authenticated couple can delete bucket list items"
  on public.bucket_items for delete to authenticated using (auth.uid() is not null);

create policy "Authenticated couple can view daily questions"
  on public.daily_questions for select to authenticated using (true);

create policy "User can view own answer, or partner answer ONLY IF user has answered"
  on public.daily_answers for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.daily_answers my_answer
      where my_answer.daily_question_id = public.daily_answers.daily_question_id
        and my_answer.user_id = auth.uid()
    )
  );

create policy "User can insert own daily answer"
  on public.daily_answers for insert to authenticated
  with check (auth.uid() = user_id);

-- ====================================================================
-- 9. STORAGE RLS POLICIES (PRIVATE PHOTOS BUCKET)
-- ====================================================================

create policy "Authenticated couple can read storage photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'photos');

create policy "Authenticated couple can upload storage photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "Authenticated couple can delete storage photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and auth.role() = 'authenticated');

-- ====================================================================
-- 10. REALTIME PUBLICATION ENABLEMENT
-- ====================================================================
alter publication supabase_realtime add table public.realtime_games;
