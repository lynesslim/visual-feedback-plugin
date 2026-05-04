<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * GitHub auto-updater for Agency Feedback WP.
 *
 * How it works:
 *  1. On WordPress's periodic update check, we query the GitHub Tags API
 *     for the latest tag on `lynesslim/visual-feedback-plugin`.
 *  2. If the latest tag version is newer than the installed version we inject
 *     an update object so WordPress shows the "Update now" button.
 *  3. On install/update WordPress downloads the source zip from GitHub.
 *  4. Because the zip root folder name may not match the installed plugin folder,
 *     we hook `upgrader_source_selection` to rename it correctly.
 */
final class AFWP_Updater
{
    private const GITHUB_REPO    = 'lynesslim/visual-feedback-plugin';
    private const PLUGIN_SLUG    = 'agency-feedback-wp/agency-feedback-wp.php';
    private const TRANSIENT_KEY  = 'afwp_github_tag';
    private const CACHE_SECONDS  = 12 * HOUR_IN_SECONDS;

    public function hooks(): void
    {
        add_filter('pre_set_site_transient_update_plugins', [$this, 'check_for_update']);
        add_filter('plugins_api',                           [$this, 'plugin_info'], 20, 3);
        add_filter('upgrader_source_selection',             [$this, 'fix_source_dir'], 10, 4);
    }

    // -------------------------------------------------------------------------
    // 1. Inject update info into WordPress's update transient
    // -------------------------------------------------------------------------
    public function check_for_update(object $transient): object
    {
        if (empty($transient->checked)) {
            return $transient;
        }

        $tag = $this->get_latest_tag();
        if (!$tag) {
            return $transient;
        }

        $latest_version = ltrim((string)($tag['name'] ?? ''), 'v');

        if (version_compare($latest_version, AFWP_VERSION, '>')) {
            $transient->response[self::PLUGIN_SLUG] = (object)[
                'slug'        => 'agency-feedback-wp',
                'plugin'      => self::PLUGIN_SLUG,
                'new_version' => $latest_version,
                'url'         => 'https://github.com/' . self::GITHUB_REPO,
                'package'     => 'https://api.github.com/repos/' . self::GITHUB_REPO . '/zipball/' . ($tag['name'] ?? ''),
                'icons'       => [],
                'banners'     => [],
                'tested'      => '6.8',
                'requires_php'=> '8.0',
            ];
        }

        return $transient;
    }

    // -------------------------------------------------------------------------
    // 2. Provide plugin details for the "View details" popup
    // -------------------------------------------------------------------------
    public function plugin_info(mixed $result, string $action, object|array $args): mixed
    {
        if ($action !== 'plugin_information') {
            return $result;
        }
        if (!isset($args->slug) || $args->slug !== 'agency-feedback-wp') {
            return $result;
        }

        $tag = $this->get_latest_tag();
        if (!$tag) {
            return $result;
        }

        $latest_version = ltrim((string)($tag['name'] ?? ''), 'v');

        return (object)[
            'name'          => 'Agency Feedback WP',
            'slug'          => 'agency-feedback-wp',
            'version'       => $latest_version,
            'author'        => 'Supercraft',
            'homepage'      => 'https://github.com/' . self::GITHUB_REPO,
            'requires_php'  => '8.0',
            'tested'        => '6.8',
            'download_link' => 'https://api.github.com/repos/' . self::GITHUB_REPO . '/zipball/' . ($tag['name'] ?? ''),
            'sections'      => [
                'description' => 'Visual feedback widget powered by Supercraft.',
                'changelog'   => 'See GitHub for release notes.',
            ],
            'last_updated'  => $tag['commit']['author']['date'] ?? '',
        ];
    }

    // -------------------------------------------------------------------------
    // 3. Rename the extracted zip folder to match the installed plugin folder
    // -------------------------------------------------------------------------
    public function fix_source_dir(
        string $source,
        string $remote_source,
        object $upgrader,
        array  $hook_extra
    ): string {
        if (
            !isset($hook_extra['plugin']) ||
            $hook_extra['plugin'] !== self::PLUGIN_SLUG
        ) {
            return $source;
        }

        global $wp_filesystem;
        $correct = trailingslashit($remote_source) . 'agency-feedback-wp/';

        if ($source !== $correct) {
            $wp_filesystem->move($source, $correct);
        }

        return $correct;
    }

    // -------------------------------------------------------------------------
    // GitHub API helper
    // -------------------------------------------------------------------------
    private function get_latest_tag(): array|false
    {
        $cached = get_transient(self::TRANSIENT_KEY);
        if (is_array($cached)) {
            return $cached;
        }

        $url      = 'https://api.github.com/repos/' . self::GITHUB_REPO . '/tags?per_page=1';
        $response = wp_remote_get($url, [
            'timeout' => 10,
            'headers' => [
                'Accept'     => 'application/vnd.github+json',
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . '; ' . home_url(),
            ],
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            return false;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!is_array($data) || empty($data[0]['name'])) {
            return false;
        }

        set_transient(self::TRANSIENT_KEY, $data[0], self::CACHE_SECONDS);
        return $data[0];
    }
}
