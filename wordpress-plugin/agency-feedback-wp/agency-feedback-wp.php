<?php
/**
 * Plugin Name: Agency Feedback WP
 * Description: Visual feedback widget powered by Supercraft.
 * Version: 0.2.0
 * Author: Supercraft
 * Requires PHP: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AFWP_VERSION', '0.2.0');
define('AFWP_FILE', __FILE__);
define('AFWP_DIR', plugin_dir_path(__FILE__));
define('AFWP_URL', plugin_dir_url(__FILE__));

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
