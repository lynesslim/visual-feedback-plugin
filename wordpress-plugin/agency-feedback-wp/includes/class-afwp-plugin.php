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
        add_action('rest_api_init', [$this, 'register_rest']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_widget']);
        add_shortcode('agency_feedback_widget', [$this, 'shortcode_widget']);
    }

    public function register_rest(): void
    {
        $cfg = AFWP_Settings::get();
        $client = new AFWP_Supabase($cfg);
        $rest = new AFWP_Rest($client);
        $rest->register_routes();
    }

    public function enqueue_widget(): void
    {
        $cfg = AFWP_Settings::get();
        if (empty($cfg['enabled'])) {
            return;
        }
        if (!$this->has_required_frontend_config($cfg)) {
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

    private function has_required_frontend_config(array $cfg): bool
    {
        return !empty($cfg['project_slug']) && !empty($cfg['embed_public_key']);
    }

    public function inject_script_attributes(string $tag, string $handle, string $src): string
    {
        if ($handle !== 'agency-feedback-widget') {
            return $tag;
        }
        $cfg = AFWP_Settings::get();
        $apiBase = untrailingslashit(rest_url('agency-feedback/v1'));
        $attrs = sprintf(
            ' src="%s" data-project="%s" data-key="%s" data-api="%s" defer',
            esc_url($src),
            esc_attr((string)$cfg['project_slug']),
            esc_attr((string)$cfg['embed_public_key']),
            esc_attr($apiBase)
        );
        return '<script' . $attrs . '></script>';
    }
}
