-- Profiles are created automatically when a Supabase Auth user signs up.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists todos_user_id_created_at_idx
  on public.todos (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.todos enable row level security;

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.todos to authenticated;

create policy "Profiles are readable by their owner"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Profiles are updatable by their owner"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can read their own todos"
on public.todos
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own todos"
on public.todos
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own todos"
on public.todos
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own todos"
on public.todos
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- SECURITY DEFINER lets this trigger create a profile at signup without
-- requiring an INSERT policy for end users on public.profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Private avatar storage. Each user's files live in a top-level folder named
-- with that user's auth.uid().
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can read their own avatar files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can upload their own avatar files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can update their own avatar files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can delete their own avatar files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Enable Postgres changes for the example realtime subscription.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'todos'
  ) then
    alter publication supabase_realtime add table public.todos;
  end if;
end
$$;
