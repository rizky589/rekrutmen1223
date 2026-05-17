create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'user');
create type public.participant_status as enum ('passed_adm', 'blocked');
create type public.answer_key as enum ('A', 'B', 'C', 'D', 'E');
create type public.attempt_status as enum ('in_progress', 'submitted', 'expired');

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  district text check (district in ('NA IX-X', 'MARBAU', 'AEK KUO', 'AEK NATAS', 'KUALUH SELATAN', 'KUALUH HILIR', 'KUALUH HULU', 'KUALUH LEIDONG')),
  phone text,
  registered_user_id uuid unique references auth.users(id) on delete set null,
  status public.participant_status not null default 'passed_adm',
  created_at timestamptz not null default now()
);

create index participants_name_birth_idx on public.participants (lower(full_name), birth_date);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  birth_date date,
  district text check (district in ('NA IX-X', 'MARBAU', 'AEK KUO', 'AEK NATAS', 'KUALUH SELATAN', 'KUALUH HILIR', 'KUALUH HULU', 'KUALUH LEIDONG')),
  participant_id uuid references public.participants(id) on delete set null,
  role public.app_role not null default 'user',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  order_number int not null unique check (order_number between 1 and 30),
  prompt text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  option_e text not null,
  correct_answer public.answer_key not null,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_id uuid references public.participants(id),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score int,
  grade numeric(5,2),
  result_status text check (result_status in ('passed', 'failed')),
  duration_seconds int,
  status public.attempt_status not null default 'in_progress',
  created_at timestamptz not null default now()
);

create unique index one_active_or_submitted_attempt_per_user
  on public.exam_attempts(user_id)
  where status in ('in_progress', 'submitted');

create table public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_answer public.answer_key,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

create table public.app_settings (
  key text primary key,
  value text not null
);

create or replace view public.exam_results as
select
  ea.id as attempt_id,
  p.full_name,
  p.birth_date,
  p.district,
  coalesce(p.phone, pr.phone) as phone,
  pr.email,
  ea.score,
  ea.grade,
  ea.result_status,
  ea.duration_seconds,
  ea.status,
  ea.started_at,
  ea.submitted_at
from public.exam_attempts ea
left join public.participants p on p.id = ea.participant_id
left join public.profiles pr on pr.id = ea.user_id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, birth_date, district, participant_id, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    new.raw_user_meta_data ->> 'district',
    nullif(new.raw_user_meta_data ->> 'participant_id', '')::uuid,
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.participants enable row level security;
alter table public.questions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;
alter table public.app_settings enable row level security;

create policy "profiles own select" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "participants own or admin select" on public.participants
for select to authenticated
using (registered_user_id = auth.uid() or public.is_admin());
create policy "participants admin all" on public.participants
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "questions select active" on public.questions for select to authenticated using (is_active or public.is_admin());
create policy "questions admin all" on public.questions for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "attempts own select" on public.exam_attempts for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "attempts own insert" on public.exam_attempts for insert to authenticated with check (user_id = auth.uid());
create policy "attempts own update" on public.exam_attempts for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "answers own select" on public.exam_answers
for select to authenticated
using (exists (select 1 from public.exam_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.is_admin())));
create policy "answers own insert" on public.exam_answers
for insert to authenticated
with check (exists (select 1 from public.exam_attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "answers own update" on public.exam_answers
for update to authenticated
using (exists (select 1 from public.exam_attempts a where a.id = attempt_id and a.user_id = auth.uid()))
with check (exists (select 1 from public.exam_attempts a where a.id = attempt_id and a.user_id = auth.uid()));

create policy "settings select auth" on public.app_settings for select to authenticated using (true);
create policy "settings admin all" on public.app_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('question-imports', 'question-imports', false) on conflict (id) do nothing;

create policy "avatar public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatar authenticated upload" on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
create policy "question imports admin upload" on storage.objects for insert to authenticated with check (bucket_id = 'question-imports' and public.is_admin());

insert into public.app_settings (key, value) values
  ('exam_open_at', ''),
  ('exam_close_at', '')
on conflict (key) do nothing;

-- Setelah membuat user admin di Supabase Auth:
-- update public.profiles set role = 'admin' where email = 'admin@example.com';
