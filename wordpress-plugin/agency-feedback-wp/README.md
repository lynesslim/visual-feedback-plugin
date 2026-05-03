# Agency Feedback WP Plugin

WordPress-native plugin that injects the visual feedback widget and serves API endpoints from `wp-json`.

## What this plugin does

- Adds a settings page in `Settings -> Agency Feedback`
- Stores Supabase credentials and project config in WordPress options
- Exposes widget-compatible API routes under:
  - `/wp-json/agency-feedback/v1/api/public/feedback`
  - `/wp-json/agency-feedback/v1/api/public/feedback/{id}`
  - `/wp-json/agency-feedback/v1/api/public/feedback/{id}/comments`
  - `/wp-json/agency-feedback/v1/api/public/feedback/verify-pin`
  - `/wp-json/agency-feedback/v1/api/public/feedback/upload`
- Injects `assets/js/agency-feedback.js` on front-end pages (when enabled)

## Requirements

- WordPress with PHP 8.0+
- Supabase project with schema already created:
  - `projects`
  - `feedback`
  - `feedback_comments`
  - `feedback.image_urls`
  - `feedback_comments.image_urls`
  - storage bucket `feedback-attachments`

## Install

1. Copy `wordpress-plugin/agency-feedback-wp` into your WP site's `wp-content/plugins/`.
2. Activate **Agency Feedback WP** in Plugins.
3. Open `Settings -> Agency Feedback`.
4. Fill:
   - Supabase URL
   - Service role key
   - Project slug
   - Embed public key
5. Save settings.

## Passcode management

- In the same settings screen, enter a 4-digit passcode in **Set feedback passcode**.
- Save settings to push `projects.feedback_passcode` to Supabase.

## Hostinger deployment notes

- Works on Hostinger WordPress hosting (no separate Next.js API host required).
- Supabase remains external and must be reachable by your WP server.
- Keep service-role key private (stored in WP options; do not expose in JS).

## Manual smoke test checklist

1. Visit any front-end page.
2. Click `Feedback` -> enter passcode.
3. Add a new pin with text and with/without images.
4. Click pin -> open detail modal quickly.
5. Add threaded reply with/without images.
6. Mark resolved and confirm visual state updates.

## Zip for upload (optional)

From the directory that contains `agency-feedback-wp`:

```bash
zip -r agency-feedback-wp.zip agency-feedback-wp
```
