<?php
if (!defined('ABSPATH')) exit;

require_once __DIR__ . '/PucReadmeParser.php';

class PluginUpdateChecker {
    private $slug = '';
    private $pluginFile = '';
    private $githubRepo = '';
    private $branch = 'main';
    private $cacheKey = '';

    public function __construct($pluginFile, $githubRepo, $branch = 'main') {
        $this->pluginFile = plugin_basename($pluginFile);
        $this->slug = dirname($this->pluginFile);
        $this->githubRepo = $githubRepo;
        $this->branch = $branch;
        $this->cacheKey = 'puc_' . md5($this->githubRepo);

        delete_transient('afwp_github_tag');
        delete_transient('afwp_github_release');

        add_filter('pre_set_site_transient_update_plugins', [$this, 'checkForUpdate']);
        add_filter('plugins_api', [$this, 'pluginInfo'], 20, 3);
        add_filter('upgrader_source_selection', [$this, 'fixSourceFolder'], 10, 4);
    }

    public function checkForUpdate($transient) {
        if (empty($transient->checked)) return $transient;

        $tag = $this->getLatestTag();
        if (!$tag) return $transient;

        $latestVersion = ltrim($tag['name'], 'v');
        $currentVersion = $this->getCurrentVersion();

        if (version_compare($latestVersion, $currentVersion, '>')) {
            $transient->response[$this->pluginFile] = (object)[
                'slug' => $this->slug,
                'plugin' => $this->pluginFile,
                'new_version' => $latestVersion,
                'url' => "https://github.com/{$this->githubRepo}",
                'package' => "https://github.com/{$this->githubRepo}/archive/refs/tags/{$tag['name']}.zip",
                'icons' => [],
                'banners' => [],
                'tested' => '6.8',
                'requires_php' => '8.0'
            ];
        }
        return $transient;
    }

    public function pluginInfo($result, $action, $args) {
        if ($action !== 'plugin_information') return $result;
        if (!isset($args->slug) || $args->slug !== $this->slug) return $result;

        $tag = $this->getLatestTag();
        if (!$tag) return $result;

        $latestVersion = ltrim($tag['name'], 'v');

        return (object)[
            'name' => 'Agency Feedback WP',
            'slug' => $this->slug,
            'version' => $latestVersion,
            'author' => 'Supercraft',
            'homepage' => "https://github.com/{$this->githubRepo}",
            'requires_php' => '8.0',
            'tested' => '6.8',
            'download_link' => "https://github.com/{$this->githubRepo}/archive/refs/tags/{$tag['name']}.zip",
            'sections' => [
                'description' => 'Visual feedback widget powered by Supercraft.',
                'changelog' => 'See GitHub for release notes.'
            ]
        ];
    }

    public function fixSourceFolder($source, $remoteSource, $upgrader, $hookExtra) {
        if (!isset($hookExtra['plugin']) || $hookExtra['plugin'] !== $this->pluginFile) {
            return $source;
        }

        global $wp_filesystem;
        $target = trailingslashit($remoteSource) . $this->slug . '/';

        $baseName = basename($source);
        if (strpos($baseName, $this->githubRepo) !== false || strpos($baseName, 'archive') !== false) {
            if (is_dir(trailingslashit($source) . 'wordpress-plugin')) {
                $wp_filesystem->move(
                    trailingslashit($source) . 'wordpress-plugin/agency-feedback-wp',
                    $target
                );
                $wp_filesystem->delete($source);
                return $target;
            }
        }

        if ($source !== $target) {
            $wp_filesystem->move($source, $target);
        }
        return $target;
    }

    private function getLatestTag() {
        $cached = get_transient($this->cacheKey);
        if ($cached) return $cached;

        $response = wp_remote_get(
            "https://api.github.com/repos/{$this->githubRepo}/tags?per_page=1",
            ['timeout' => 10, 'headers' => ['Accept' => 'application/vnd.github+json']]
        );

        if (is_wp_error($response)) return false;
        if (wp_remote_retrieve_response_code($response) !== 200) return false;

        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (empty($data[0]['name'])) return false;

        set_transient($this->cacheKey, $data[0], 12 * HOUR_IN_SECONDS);
        return $data[0];
    }

    private function getCurrentVersion() {
        if (defined('AFWP_VERSION')) return AFWP_VERSION;
        $data = get_plugin_data($this->pluginFile);
        return $data['Version'] ?? '0';
    }
}