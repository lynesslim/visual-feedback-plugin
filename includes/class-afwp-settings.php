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
        global $menu;

        $supercraft_exists = false;
        foreach ($menu as $item) {
            if (isset($item[0]) && strpos($item[0], 'Supercraft') !== false) {
                $supercraft_exists = true;
                break;
            }
        }

if ($supercraft_exists) {
            add_submenu_page(
                'supercraft',
                'Visual Feedback',
                'Visual Feedback',
                'manage_options',
                'agency-feedback',
                [$this, 'render_page']
            );
        } else {
            add_menu_page(
                'Supercraft',
                'Supercraft',
                'manage_options',
                'supercraft',
                '__return_empty_string',
                'dashicons-superhero',
                3
            );
            add_submenu_page(
                'supercraft',
                'Visual Feedback',
                'Visual Feedback',
                'manage_options',
                'agency-feedback',
                [$this, 'render_page']
            );
            add_action('admin_menu', function() {
                remove_submenu_page('supercraft', 'supercraft');
            }, 999);
        }
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
        $embed_key = sanitize_text_field((string)($input['embed_public_key'] ?? ''));

        if ($embed_key !== '') {
            $response = wp_remote_get(
                'https://superapp.supercraft.my/api/public/feedback?embed_key=' . urlencode($embed_key) . '&includeResolved=1',
                [
                    'timeout' => 15,
                    'headers' => ['Accept' => 'application/json'],
                ]
            );

            if (is_wp_error($response)) {
                add_settings_error(self::OPTION_KEY, 'api_error', 'Could not validate embed key. Please try again.', 'error');
                $next['embed_public_key'] = $current['embed_public_key'];
            } else {
                $code = wp_remote_retrieve_response_code($response);
                if ($code >= 400) {
                    add_settings_error(self::OPTION_KEY, 'invalid_key', 'Invalid embed key. Please check and try again.', 'error');
                    $next['embed_public_key'] = $current['embed_public_key'];
                } else {
                    $next['embed_public_key'] = $embed_key;
                }
            }
        } else {
            $next['embed_public_key'] = '';
        }

        return $next;
    }

    public function render_page(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }
        $settings = self::get();
        $has_key = !empty($settings['embed_public_key']);
        ?>
        <div class="wrap">
          <h1>Agency Feedback</h1>
          <?php if (!$has_key): ?>
            <div class="notice notice-warning">
              <p><strong>Widget disabled:</strong> Enter and validate an embed public key to enable the feedback widget on your site.</p>
            </div>
          <?php else: ?>
            <div class="notice notice-success">
              <p><strong>Widget enabled:</strong> The feedback widget is active on your site.</p>
            </div>
          <?php endif; ?>
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
                <th scope="row"><label for="afwp_embed_public_key">Embed public key</label></th>
                <td>
                  <?php if ($has_key): ?>
                    <span style="display: flex; align-items: center; gap: 8px;">
                      <input class="regular-text" id="afwp_embed_public_key" type="text" value="<?php echo esc_attr((string)$settings['embed_public_key']); ?>" readonly style="background: #f0f0f1; color: #646970;" />
                      <span style="color: #2e7d32; font-weight: bold;">✓ Validated</span>
                    </span>
                  <?php else: ?>
                    <input class="regular-text" id="afwp_embed_public_key" type="text" name="<?php echo esc_attr(self::OPTION_KEY); ?>[embed_public_key]" value="" placeholder="Enter embed public key" />
                  <?php endif; ?>
                </td>
              </tr>
            </table>
            <?php submit_button('Save settings'); ?>
          </form>
        </div>
        <?php
    }
}
