-- Add image attachments support for feedback and thread comments
alter table public.feedback
  add column if not exists image_urls text[] not null default '{}';

alter table public.feedback_comments
  add column if not exists image_urls text[] not null default '{}';

comment on column public.feedback.image_urls is 'Public URLs for image attachments on original pin feedback.';
comment on column public.feedback_comments.image_urls is 'Public URLs for image attachments on threaded comments.';

-- Public bucket for staging feedback attachments.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'feedback-attachments',
  'feedback-attachments',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
