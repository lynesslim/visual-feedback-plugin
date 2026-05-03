-- AgencyFeedback: initial schema, RLS (agency staff only), Realtime on feedback
-- Run via Supabase Dashboard → SQL → New query, or: supabase db push (CLI)

-- Extensions (gen_random_uuid)
create extension if not exists "pgcrypto";

-- Projects (staging sites / embed targets)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  staging_base_url text not null,
  embed_public_key text not null,
  feedback_passcode text not null default '0000',
  created_at timestamptz not null default now(),
  constraint projects_feedback_passcode_format check (feedback_passcode ~ '^\d{4}$')
);

comment on table public.projects is 'Per-client staging site; embed_public_key is the secret sent by the widget (via your Next.js API, not exposed as open insert).';
comment on column public.projects.embed_public_key is 'Long random string; rotate in dashboard if leaked.';
comment on column public.projects.feedback_passcode is '4-digit PIN; widget verifies before comment mode; change in dashboard or SQL.';

-- Feedback pins
create type public.feedback_status as enum ('open', 'in_progress', 'resolved');
create type public.feedback_priority as enum ('low', 'medium', 'high');

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  selector text not null,
  coordinates jsonb not null,
  comment_text text not null,
  author text not null,
  metadata jsonb not null default '{}'::jsonb,
  status public.feedback_status not null default 'open',
  priority public.feedback_priority,
  url_path text not null default '',
  created_at timestamptz not null default now()
);

create index feedback_project_status_created_idx
  on public.feedback (project_id, status, created_at desc);
create index feedback_project_url_path_idx
  on public.feedback (project_id, url_path);

-- RLS: block direct anon access; dashboard uses authenticated JWT; API uses service_role (bypasses RLS)
alter table public.projects enable row level security;
alter table public.feedback enable row level security;

-- MVP: any logged-in user is "staff" and can manage all rows (tighten with project_members later)
create policy "authenticated_select_projects"
  on public.projects for select to authenticated using (true);
create policy "authenticated_insert_projects"
  on public.projects for insert to authenticated with check (true);
create policy "authenticated_update_projects"
  on public.projects for update to authenticated using (true) with check (true);
create policy "authenticated_delete_projects"
  on public.projects for delete to authenticated using (true);

create policy "authenticated_select_feedback"
  on public.feedback for select to authenticated using (true);
create policy "authenticated_insert_feedback"
  on public.feedback for insert to authenticated with check (true);
create policy "authenticated_update_feedback"
  on public.feedback for update to authenticated using (true) with check (true);
create policy "authenticated_delete_feedback"
  on public.feedback for delete to authenticated using (true);

-- Realtime: dashboard + widget subscriptions on feedback
alter publication supabase_realtime add table public.feedback;
alter table public.feedback replica identity full;
