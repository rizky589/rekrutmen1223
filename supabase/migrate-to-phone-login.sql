-- Jalankan file ini jika schema lama yang masih memakai NIK/email peserta sudah terlanjur dibuat.
-- Untuk project Supabase baru/kosong, cukup jalankan supabase/schema.sql saja.

alter table public.participants add column if not exists birth_date date;
alter table public.participants add column if not exists district text;
alter table public.participants add column if not exists registered_user_id uuid unique references auth.users(id) on delete set null;
alter table public.participants alter column birth_date drop not null;
alter table public.participants alter column district drop not null;
alter table public.participants alter column nik drop not null;
alter table public.questions add column if not exists option_e text;
alter table public.exam_attempts add column if not exists grade numeric(5,2);
alter table public.exam_attempts add column if not exists result_status text;

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists district text;
alter table public.profiles add column if not exists participant_id uuid references public.participants(id) on delete set null;

alter type public.answer_key add value if not exists 'E';

create index if not exists participants_name_birth_idx on public.participants (lower(full_name), birth_date);

drop view if exists public.exam_results;

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
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    birth_date = excluded.birth_date,
    district = excluded.district,
    participant_id = excluded.participant_id;
  return new;
end;
$$;
