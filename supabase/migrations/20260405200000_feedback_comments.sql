-- Threaded replies on feedback (client vs agency)
create type public.feedback_comment_author as enum ('client', 'agency');

create table public.feedback_comments (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedback (id) on delete cascade,
  author_type public.feedback_comment_author not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index feedback_comments_feedback_created_idx
  on public.feedback_comments (feedback_id, created_at asc);

alter table public.feedback_comments enable row level security;

create policy "authenticated_select_feedback_comments"
  on public.feedback_comments for select to authenticated using (true);
create policy "authenticated_insert_feedback_comments"
  on public.feedback_comments for insert to authenticated with check (true);
create policy "authenticated_update_feedback_comments"
  on public.feedback_comments for update to authenticated using (true) with check (true);
create policy "authenticated_delete_feedback_comments"
  on public.feedback_comments for delete to authenticated using (true);

comment on table public.feedback_comments is 'Threaded comments on a pin; client vs agency.';
