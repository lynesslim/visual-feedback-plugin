<?php
/**
 * Plugin Name: Agency Feedback WP
 * Description: Visual feedback widget powered by Supercraft.
 * Version: 0.3.9
 * Author: Supercraft
 * Requires PHP: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AFWP_VERSION', '0.3.9');
define('AFWP_FILE', __FILE__);
define('AFWP_DIR', plugin_dir_path(__FILE__));
define('AFWP_URL', plugin_dir_url(__FILE__));

require_once AFWP_DIR . 'vendor/plugin-update-checker.php';
$githubUpdater = YahnisElsts\PluginUpdateChecker\v5p6\PucFactory::buildUpdateChecker(
    'https://github.com/lynesslim/visual-feedback-plugin',
    __FILE__,
    'agency-feedback-wp'
);

// Optional: Set the branch that contains the stable release.
// $myUpdateChecker->setBranch('main');

/**
 * Fix for GitHub repository subdirectory structure.
 *
 * When downloading from GitHub, the plugin is located in a subfolder.
 * This filter renames the extracted directory so WordPress can find the plugin files.
 */
add_filter('upgrader_source_selection', function($source, $remote_source, $upgrader, $hook_extra) {
	if (!isset($hook_extra['plugin']) || $hook_extra['plugin'] !== 'agency-feedback-wp/agency-feedback-wp.php') {
		return $source;
	}

	global $wp_filesystem;
	$target = trailingslashit($remote_source) . 'agency-feedback-wp/';

	// If the repo has a 'wordpress-plugin' folder, move the inner plugin folder out.
	$sub_path = trailingslashit($source) . 'wordpress-plugin/agency-feedback-wp';
	if ($wp_filesystem->exists($sub_path)) {
		$wp_filesystem->move($sub_path, $target);
		$wp_filesystem->delete($source);
		return $target;
	}

	return $source;
}, 10, 4);

require_once AFWP_DIR . 'includes/class-afwp-settings.php';
require_once AFWP_DIR . 'includes/class-afwp-plugin.php';

function afwp_bootstrap(): void
{
    static $instance = null;
    if ($instance instanceof AFWP_Plugin) {
        return;
    }
    $instance = new AFWP_Plugin();
    $instance->init();
}

afwp_bootstrap();
