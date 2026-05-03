<?php

if (!defined('ABSPATH')) {
    exit;
}

final class AFWP_Settings
{
    public const OPTION_KEY = 'afwp_settings';

    public function hooks(): void
    {
        add_action('admin_menu', [$this, 'register_menu']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    public static function defaults(): array
    {
        return [
            'enabled' => 1,
            'supabase_url' => '',
            'service_role_key' => '',
            'project_slug' => '',
            'embed_public_key' => '',
        ];
    }

    public static function get(): array
    {
        $saved = get_option(self::OPTION_KEY, []);
        if (!is_array($saved)) {
            $saved = [];
        }
        return array_merge(self::defaults(), $saved);
    }

    public function register_menu(): void
    {
        add_options_page(
            'Agency Feedback',
            'Agency Feedback',
            'manage_options',
            'agency-feedback',
            [$this, 'render_page']
        );
    }

    public function register_settings(): void
    {
        register_setting(
            'afwp_settings_group',
            self::OPTION_KEY,
            [$this, 'sanitize_settings']
        );
    }

    public function sanitize_settings(array $input): array
    {
        $current = self::get();
        $next = $current;
        $next['enabled'] = !empty($input['enabled']) ? 1 : 0;
        $next['supabase_url'] = esc_url_raw((string)($input['supabase_url'] ?? ''));
        $next['project_slug'] = sanitize_text_field((string)($input['project_slug'] ?? ''));
        $next['embed_public_key'] = sanitize_text_field((string)($input['embed_public_key'] ?? ''));

        // Preserve existing secret unless user enters a new one.
        $newKey = trim((string)($input['service_role_key'] ?? ''));
        if ($newKey !== '') {
            $next['service_role_key'] = $newKey;
        }

        $passcode = preg_replace('/\D+/', '', (string)($input['feedback_passcode'] ?? ''));
        if ($passcode !== '') {
            if (strlen($passcode) !== 4) {
                add_settings_error(
                    self::OPTION_KEY,
                    'afwp_passcode_invalid',
                    'Passcode must be exactly 4 digits.',
                    'error'
                );
            } else {
                $client = new AFWP_Supabase($next);
                $ok = $client->update_project_passcode($next['project_slug'], $passcode);
                if (!$ok) {
                    add_settings_error(
                        self::OPTION_KEY,
                        'afwp_passcode_update_failed',
                        'Could not update passcode in Supabase.',
                        'error'
                    );
                } else {
                    add_settings_error(
                        self::OPTION_KEY,
                        'afwp_passcode_updated',
                        'Passcode updated.',
                        'updated'
                    );
                }
            }
        }

        return $next;
    }

    public function render_page(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }
        $settings = self::get();
        ?>
        <div class="wrap">
          <h1>Agency Feedback</h1>
          <p>Configure widget and Supabase credentials.</p>
          <?php settings_errors(self::OPTION_KEY); ?>
          <form method="post" action="options.php">
            <?php settings_fields('afwp_settings_group'); ?>
            <table class="form-table" role="presentation">
              <tr>
                <th scope="row">Enable widget</th>
                <td>
                  <label>
                    <input type="checkbox" name="<?php echo esc_attr(self::OPTION_KEY); ?>[enabled]" value="1" <?php checked((int)$settings['enabled'], 1); ?> />
                    Inject on front-end pages
                  </label>
                </td>
              </tr>
              <tr>
                <th scope="row"><label for="afwp_supabase_url">Supabase URL</label></th>
                <td><input class="regular-text" id="afwp_supabase_url" type="url" name="<?php echo esc_attr(self::OPTION_KEY); ?>[supabase_url]" value="<?php echo esc_attr((string)$settings['supabase_url']); ?>" /></td>
              </tr>
              <tr>
                <th scope="row"><label for="afwp_service_role_key">Service role key</label></th>
                <td>
                  <input class="regular-text" id="afwp_service_role_key" type="password" placeholder="<?php echo $settings['service_role_key'] ? 'Stored (leave blank to keep)' : ''; ?>" name="<?php echo esc_attr(self::OPTION_KEY); ?>[service_role_key]" value="" />
                </td>
              </tr>
              <tr>
                <th scope="row"><label for="afwp_project_slug">Project slug</label></th>
                <td><input class="regular-text" id="afwp_project_slug" type="text" name="<?php echo esc_attr(self::OPTION_KEY); ?>[project_slug]" value="<?php echo esc_attr((string)$settings['project_slug']); ?>" /></td>
              </tr>
              <tr>
                <th scope="row"><label for="afwp_embed_public_key">Embed public key</label></th>
                <td><input class="regular-text" id="afwp_embed_public_key" type="text" name="<?php echo esc_attr(self::OPTION_KEY); ?>[embed_public_key]" value="<?php echo esc_attr((string)$settings['embed_public_key']); ?>" /></td>
              </tr>
              <tr>
                <th scope="row"><label for="afwp_feedback_passcode">Set feedback passcode</label></th>
                <td>
                  <input class="small-text" id="afwp_feedback_passcode" type="text" maxlength="4" pattern="\d{4}" name="<?php echo esc_attr(self::OPTION_KEY); ?>[feedback_passcode]" value="" />
                  <p class="description">Optional. Enter 4 digits to update in Supabase.</p>
                </td>
              </tr>
            </table>
            <?php submit_button('Save settings'); ?>
          </form>
        </div>
        <?php
    }
}
