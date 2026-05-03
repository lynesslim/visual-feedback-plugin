-- Legacy upgrade: databases created from an older init migration without feedback_passcode.
-- Fresh installs get this column from 20260405160000_init_agencyfeedback.sql; this file is a no-op then.
alter table public.projects
  add column if not exists feedback_passcode text;

update public.projects
set feedback_passcode = '0000'
where feedback_passcode is null;

alter table public.projects
  alter column feedback_passcode set not null;

alter table public.projects
  drop constraint if exists projects_feedback_passcode_format;

alter table public.projects
  add constraint projects_feedback_passcode_format
  check (feedback_passcode ~ '^\d{4}$');

comment on column public.projects.feedback_passcode is '4-digit PIN; widget verifies before comment mode; change in dashboard or SQL.';
