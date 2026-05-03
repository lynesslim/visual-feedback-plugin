<?php

if (!defined('ABSPATH')) {
    exit;
}

final class AFWP_Plugin
{
    private AFWP_Settings $settings;

    public function __construct()
    {
        $this->settings = new AFWP_Settings();
    }

    public function init(): void
    {
        $this->settings->hooks();
        add_action('wp_enqueue_scripts', [$this, 'enqueue_widget']);
        add_shortcode('agency_feedback_widget', [$this, 'shortcode_widget']);
    }

    public function enqueue_widget(): void
    {
        $cfg = AFWP_Settings::get();
        if (empty($cfg['enabled'])) {
            return;
        }
        if (empty($cfg['embed_public_key'])) {
            return;
        }
        wp_register_script(
            'agency-feedback-widget',
            AFWP_URL . 'assets/js/agency-feedback.js',
            [],
            AFWP_VERSION,
            true
        );
        wp_enqueue_script('agency-feedback-widget');
        add_filter('script_loader_tag', [$this, 'inject_script_attributes'], 10, 3);
    }

    public function shortcode_widget(): string
    {
        $this->enqueue_widget();
        return '';
    }

    public function inject_script_attributes(string $tag, string $handle, string $src): string
    {
        if ($handle !== 'agency-feedback-widget') {
            return $tag;
        }
        $cfg    = AFWP_Settings::get();
        $apiUrl = untrailingslashit(AFWP_Settings::API_BASE) . '/api/feedback';
        $attrs  = sprintf(
            ' src="%s" data-key="%s" data-api="%s" defer',
            esc_url($src),
            esc_attr((string)$cfg['embed_public_key']),
            esc_attr($apiUrl)
        );
        return '<script' . $attrs . '></script>';
    }
}

