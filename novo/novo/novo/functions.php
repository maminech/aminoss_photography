<?php

if (!function_exists('novo_setup')):
  function novo_setup() {
    load_theme_textdomain('novo', get_template_directory() . '/languages');
    add_theme_support('automatic-feed-links');
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('woocommerce');

    register_nav_menus(array(
      'navigation' => esc_html__('Navigation', 'novo'),
    ));

    if (!isset($content_width)) {
      $content_width = 900;
    }

    $tags = get_the_tag_list();
  }
endif;
add_action('after_setup_theme', 'novo_setup');

/**
 * Register widget area.
 */
function novo_widgets_init() {
  register_sidebar(array(
    'name' => esc_html__('Sidebar', 'novo'),
    'id' => 'sidebar',
    'description' => esc_html__('Add widgets here.', 'novo'),
    'before_widget' => '<div id="%1$s" class="widget %2$s">',
    'after_widget' => '</div>',
    'before_title' => '<h5 class="widget-title">',
    'after_title' => '</h5>',
  ));
  register_sidebar(array(
    'name' => esc_html__('Blog Sidebar', 'novo'),
    'id' => 'blog-sidebar',
    'description' => esc_html__('Add widgets here.', 'novo'),
    'before_widget' => '<div id="%1$s" class="widget %2$s">',
    'after_widget' => '</div>',
    'before_title' => '<div class="heading-decor"><h5><span>',
    'after_title' => '</span></h5></div>',
  ));
  register_sidebar(array(
    'name' => esc_html__('Footer col 1', 'novo'),
    'id' => 'footer-1',
    'description' => esc_html__('Add widgets here.', 'novo'),
    'before_widget' => '<div id="%1$s" class="widget %2$s">',
    'after_widget' => '</div>',
    'before_title' => '<div class="heading-decor"><h5><span>',
    'after_title' => '</span></h5></div>',
  ));
  register_sidebar(array(
    'name' => esc_html__('Footer col 2', 'novo'),
    'id' => 'footer-2',
    'description' => esc_html__('Add widgets here.', 'novo'),
    'before_widget' => '<div id="%1$s" class="widget %2$s">',
    'after_widget' => '</div>',
    'before_title' => '<div class="heading-decor"><h5><span>',
    'after_title' => '</span></h5></div>',
  ));
  register_sidebar(array(
    'name' => esc_html__('Footer col 3', 'novo'),
    'id' => 'footer-3',
    'description' => esc_html__('Add widgets here.', 'novo'),
    'before_widget' => '<div id="%1$s" class="widget %2$s">',
    'after_widget' => '</div>',
    'before_title' => '<div class="heading-decor"><h5><span>',
    'after_title' => '</span></h5></div>',
  ));
  register_sidebar(array(
    'name' => esc_html__('Footer col 4', 'novo'),
    'id' => 'footer-4',
    'description' => esc_html__('Add widgets here.', 'novo'),
    'before_widget' => '<div id="%1$s" class="widget %2$s">',
    'after_widget' => '</div>',
    'before_title' => '<div class="heading-decor"><h5><span>',
    'after_title' => '</span></h5></div>',
  ));
}
add_action('widgets_init', 'novo_widgets_init');

/**
 * Add Google fonts.
 */

function yprm_google_fonts() {
  if (class_exists('WPBakeryShortCode')) {
    return false;
  }

  $font_url = add_query_arg('family', 'Montserrat:300,400,400i,500,600,700', "//fonts.googleapis.com/css");

  return $font_url;
}

/*
 * Remove default woocommerce css
 */
add_filter('woocommerce_enqueue_styles', '__return_false');

/**
 * Register Scripts
 */
function novo_register_scripts() {
  wp_register_style('select2', get_parent_theme_file_uri() . '/css/select2.css');
  wp_register_style('fontawesome', get_parent_theme_file_uri() . '/css/fontawesome.min.css', '5.7.2');

  wp_register_style('novo-icons', get_parent_theme_file_uri() . '/css/iconfont.css');
}
add_action('wp_loaded', 'novo_register_scripts');

/**
 * Enqueue scripts and styles.
 */
function novo_scripts() {
  //wp_enqueue_style('novo-google-fonts', yprm_google_fonts(), array(), '1.0.0');
  //wp_enqueue_style('novo-typekit-fonts', yprm_typekit_fonts(), array(), '1.0.0');
  wp_enqueue_style('fontawesome');
  wp_enqueue_style('novo-icons');
  //wp_enqueue_style('swiper');
  wp_enqueue_style('circle-animations', get_parent_theme_file_uri() . '/css/circle_animations.css');
  wp_enqueue_style('novo-style', get_stylesheet_uri());
  
  if($decor_color =  yprm_get_theme_setting('decor_color')) {
    wp_add_inline_style('novo-style',  'body .booked-modal input.button.button-primary,body .booked-calendar-shortcode-wrap .booked-calendar tbody td.today:hover .date .number {
      background: '.$decor_color.' !important;
    }');
  }

  if (class_exists('woocommerce')) {
    wp_enqueue_style('woocommerce-general', get_parent_theme_file_uri() . '/css/woocommerce.css');
    //wp_enqueue_style('woocommerce-smallscreen', get_parent_theme_file_uri() . '/css/woocommerce-smallscreen.css');
    wp_enqueue_style('woocommerce-layout', get_parent_theme_file_uri() . '/css/woocommerce-layout.css');
    wp_enqueue_style('select2', get_parent_theme_file_uri() . '/css/select2.css');
  }

  wp_enqueue_style('novo-main-style', get_parent_theme_file_uri() . '/css/style.css');
  //wp_enqueue_script('swiper');
  
  wp_enqueue_script('imagesloaded');
  wp_enqueue_script('isotope', get_parent_theme_file_uri() . '/js/isotope.pkgd.min.js', array('jquery'), '3.0.6', true);
  wp_enqueue_script('novo-script', get_parent_theme_file_uri() . '/js/scripts.js', array('jquery'), null, true);

  if (is_singular() && comments_open() && get_option('thread_comments')) {
    wp_enqueue_script('comment-reply');
  }
}
add_action('wp_enqueue_scripts', 'novo_scripts', 2000);

function novo_mobile_scripts() {
  wp_enqueue_style('novo-main-mobile', get_parent_theme_file_uri() . '/css/mobile.css');
}
add_action('wp_enqueue_scripts', 'novo_mobile_scripts', 2000000);

/**
 * Enqueue Admin Scripts And Styles
 */

function novo_admin_scripts() {
  wp_enqueue_style('novo-admin-style', get_parent_theme_file_uri() . '/css/admin.css');

  $request_uri = filter_input(INPUT_SERVER, 'REQUEST_URI');

  if ($request_uri === null) {
      $request_uri = '';  
  } else {
      $request_uri = (string) $request_uri;  
  }
  
  if (strpos($request_uri, get_admin_url(null, 'admin.php?page=Novo', 'relative')) !== false) {
      wp_enqueue_style('fontawesome', get_parent_theme_file_uri() . '/css/fontawesome.min.css', '5.7.2');
  }

  wp_enqueue_script('novo-admin', get_parent_theme_file_uri() . '/js/admin.js', array('jquery'), null, true);
}
add_action('admin_enqueue_scripts', 'novo_admin_scripts', 1000);

/**
 * Add Editor Styles
 */

function novo_add_editor_styles() {
  add_editor_style(get_parent_theme_file_uri() . '/css/style.css');
}
add_action('after_setup_theme', 'novo_add_editor_styles');

/**
 * Load TGM
 */
require get_template_directory() . '/tgm/tgm.php';

/**
 * Admin Pages
 */
require get_template_directory() . '/inc/admin-pages.php';

/**
 * Hooks
 */
require get_template_directory() . '/inc/v-hook.php';
require get_template_directory() . '/inc/hooks.php';

/**
 * Woocommerce
 */

if (class_exists('WooCommerce')) {
  require get_template_directory() . '/inc/woocommerce.php';
}

/**
 * Setup Wizard
 */

if (is_admin()) {
  require_once get_template_directory() . '/inc/setup-wizard/envato_setup_init.php';
  require_once get_template_directory() . '/inc/setup-wizard/envato_setup.php';
}

/**
 * Redux Settings
 */
require get_template_directory() . '/inc/redux-settings.php';

/**
 * Advansed Custom Field
 */
require get_template_directory() . '/inc/acf.php';
define('ACF_LITE', true);

/**
 * FIX Editor Contact Form 7
 */
add_filter('wpcf7_autop_or_not', '__return_false');
add_filter( 'big_image_size_threshold', '__return_false' );
