<?php

/**
 * Get Theme Settins
 */

if (!function_exists('yprm_get_theme_setting')) {
  function yprm_get_theme_setting($param = false) {
    global $novo_theme;
    $result = false;
    $defaults = array(
      // General

      'site_color_mode' => 'dark',
      'decor_color' => '#c48f56',
      'right_click_disable' => 'false',
      'right_click_disable_message' => wp_kses_post(__('<p style="text-align: center"><strong><span style="font-size: 18px">Content is protected. Right-click function is disabled.</span></strong></p>', 'novo')),
      'protected_title' => esc_html__('This content is password protected.', 'novo'),
      'protected_message' => esc_html__('To view it please enter your password below:', 'novo'),
      'mobile_adaptation' => 'false',
      'cat_prefix' => 'true',
      'custom_cursor' => 'false',
      'lazyload' => 'false',

      // Preloader

      'preloader_show' => 'true',
      'preloader_type' => 'cube',
      'preloader_type' => 'words',

      // Header

      'header_style' => 'logo_left',
      'header_container' => 'container-fluid',
      'header_color_mode' => 'light',
      'header_space' => 'true',
      'header_social_links' => 'true',
      'header_cart' => 'true',
      'header_search' => 'true',
      'header_sticky' => 'true',

      // Navigation

      'navigation_type' => 'visible_menu',
      'navigation_item_hover_style' => 'style1',

      // Social Links

      'social_target' => '_self',

      // Custom Fonts

      'custom_fonts' => array(
        'fonts' => '',
      ),

      // Footer

      'footer_social_buttons' => 'show',
      'footer_logo' => 'show',
      'footer' => 'show',
      'footer_scroll_up' => 'show',
      'footer_decor' => 'show',
      'footer_col_1' => 'col-12 col-md-4',
      'footer_col_2' => 'col-12 col-sm-6 col-md-4',
      'footer_col_3' => 'col-12 col-sm-6 col-md-4',
      'footer_col_4' => '',

      // 404 Page

      'site_scheme_404' => 'light',
      '404_heading' => __('<span>404</span><br>ERROR', 'novo'),
      '404_page_desc' => esc_html__('The page you are looking for doesn`t exist anymore', 'novo'),

      // Coming Soon Page

      'site_scheme_coming_soon' => 'light',
      'coming_soon_heading' => esc_html__('Coming soon', 'novo'),
      'coming_soon_subscribe_desc' => esc_html__('Subscribe and get the latest updates', 'novo'),
      'coming_soon_subscribe_code' => esc_html__('Subscribe form code', 'novo'),

      // Project Page

      'project_style' => 'slider',
      'project_count_cols' => 'col2',
      'project_image' => 'full',
      'project_share' => 'show',
      'project_date' => 'show',
      'project_like' => 'show',
      'project_navigation' => 'show',
      'project_footer' => 'minified',

      // LightBox

      'popup_arrows' => 'show',
      'popup_counter' => 'show',
      'popup_back_to_grid' => 'show',
      'popup_fullscreen' => 'show',
      'popup_autoplay' => 'show',
      'popup_share' => 'show',
      'popup_likes' => 'show',
      'popup_project_link' => 'show',
      'popup_image_title' => 'show',
      'popup_image_desc' => 'show',
      'popup_desc_size' => 140,
      'popup_image_overlay' => 'show',

      // Blog Categories Style

      'blog_type' => 'grid',
      'blog_cols' => 'col3',
      'blog_post_author' => 'show',
      'blog_image' => 'show',
      'blog_date' => 'show',
      'blog_short_desc' => 'show',
      'blog_read_more' => 'show',
      'blog_comments' => 'show',
      'blog_likes' => 'show',

      // Blog Post

      'blog_feature_image' => 'show',
      'blog_share' => 'show',
      'blog_date' => 'show',
      'blog_like' => 'show',
      'blog_comments' => 'show',
      'blog_sidebar' => 'show',
      'blog_navigation' => 'show',

      // Portfolio Categories Style

      'project_in_popup' => 'no',
      'portfolio_style' => 'grid',
      'portfolio_cols' => 'col3',

      // Shop

      'shop_cols' => '3',

			// Share Buttons

			'share_facebook' => 'true',
			'share_pinterest' => 'true',
			'share_google_plus' => 'true',
			'share_tumblr' => 'true',
      'share_twitter' => 'true',
      'share_snapchat' => 'true',
      
			// Product

			'product_featured_image' => 'cover',
			'product_share_links' => 'true',
			'product_categories' => 'true',
			'product_breadcrumbs' => 'true',
			'product_back_button' => 'true',

      // GDPR

      'use_gdpr' => 'true',
      'gdpr_text' => wp_kses(__('This website uses cookies to improve your experience. <a href="#">Cookie Policy</a>', 'novo'), 'post'),

      // Translations

      'tr_load_more' => esc_html__('Load More', 'novo'),
      'tr_all' => esc_html__('All', 'novo'),
      'tr_share' => esc_html__('Share: ', 'novo'),
      'tr_close' => esc_html__('Close', 'novo'),
      'tr_read_more' => esc_html__('Read More', 'novo'),
      'tr_view' => esc_html__('View', 'novo'),
      'tr_drag' => esc_html__('Drag', 'novo'),
      'tr_play' => esc_html__('Play', 'novo'),
      'tr_pause' => esc_html__('Pause', 'novo'),
      'tr_scroll_down' => esc_html__('Scroll Down', 'novo'),
      'tr_zoom' => esc_html__('Zoom', 'novo'),
      'tr_director' => esc_html__('Director', 'novo'),
      'tr_location' => esc_html__('Location', 'novo'),
      'tr_duration' => esc_html__('Duration', 'novo'),
      'tr_year_created' => esc_html__('Year Created', 'novo'),
      'tr_view_full_project' => esc_html__('View Full Project', 'novo'),
      'tr_prev' => esc_html__('Prev', 'novo'),
      'tr_next' => esc_html__('Next', 'novo'),
      'tr_send' => esc_html__('Send', 'novo'),
      'tr_options' => esc_html__('options', 'novo'),
			'tr_back' => esc_html__('Back', 'novo'),
    );

    if (function_exists('get_field') && !empty(get_field($param)) && get_field($param) != 'default' && !is_search()) {
      $result = get_field($param);
    } elseif (class_exists('Redux') && is_array($novo_theme) && !empty($novo_theme[$param])) {
      $result = $novo_theme[$param];
    } elseif (is_array($defaults) && !empty($defaults[$param])) {
      $result = $defaults[$param];
    }

    if (is_404()) {
      ($param == 'header_space') ? $result = 'true' : '';
      ($param == 'footer') ? $result = 'false' : '';
    } elseif (is_page_template('page-coming-soon.php')) {
      ($param == 'header_space') ? $result = 'true' : '';
      ($param == 'navigation_type') ? $result = 'disabled' : '';
      ($param == 'header_cart') ? $result = 'false' : '';
      ($param == 'header_search') ? $result = 'false' : '';
      ($param == 'footer') ? $result = 'false' : '';
    } elseif ($param == 'pid') {
      $result = get_the_ID();
    } 
    
    if (is_single()) {
      ($param == 'header_space') ? $result = 'yes' : '';
    } 
    
    if(get_post_type() == 'yprm_header_builder' && $param == 'site_color_mode') {
      $header_builder = json_decode(get_field('header_builder', get_the_ID()));

      $color_mode = 'light';

			if(yprm_get_theme_setting('header_color_mode') != 'default') {
				$color_mode = yprm_get_theme_setting('header_color_mode');
			} elseif(isset($header_builder->desktop->values->color_mode) && !empty($header_builder->desktop->values->color_mode)) {
				$color_mode = $header_builder->desktop->values->color_mode;
			}

      return $color_mode == 'dark' ? 'light' : 'dark';
    }

    

    return $result;
  }
}

/**
 * Body Class
 */

if (!function_exists('yprm_body_class')) {
  function yprm_body_class($classes) {
    if (function_exists('yprm_get_theme_setting')) {
      $classes[] = 'site-' . yprm_get_theme_setting('site_color_mode');
      $classes[] = 'header_type_' . yprm_get_theme_setting('header_style');
      $classes[] = 'header_space_' . yprm_get_theme_setting('header_space');
      $classes[] = 'mobile_' . yprm_get_theme_setting('mobile_adaptation');
      $classes[] = 'nav_hover_' . yprm_get_theme_setting('navigation_item_hover_style');
      $classes[] = 'lazyload_' . yprm_get_theme_setting('lazyload');

      if (yprm_get_theme_setting('right_click_disable') == 'true') {
        $classes[] = 'right-click-disable';
      }

      if (yprm_get_theme_setting('project_image_zoom') == 'hide') {
        $classes[] = 'hide-popup-zoom';
      }

      if (yprm_get_theme_setting('project_image_full_screen') == 'hide') {
        $classes[] = 'hide-popup-full-screen';
      }

      if (yprm_get_theme_setting('project_image_share') == 'hide') {
        $classes[] = 'hide-popup-share';
      }

      if (yprm_get_theme_setting('project_image_like') == 'hide') {
        $classes[] = 'hide-popup-like';
      }

      if (yprm_get_theme_setting('popup_image_overlay') == 'hide') {
        $classes[] = 'hide-popup-image-overlay';
      }

      return $classes;
    }
  }
  add_filter('body_class', 'yprm_body_class');
}

/**
 * Yprm Custom Head Script
 */

if (!function_exists('yprm_custom_head_script')) {
  function yprm_custom_head_script() {
    if (function_exists('yprm_get_theme_setting') && !empty(yprm_get_theme_setting('code_in_head'))) {
      echo yprm_get_theme_setting('code_in_head');
    }
  }
  add_action( 'wp_head', 'yprm_custom_head_script', 0 );
}

/**
 * Yprm Custom Footer Script
 */

if (!function_exists('yprm_custom_footer_script')) {
  function yprm_custom_footer_script() {
    if (function_exists('yprm_get_theme_setting') && !empty(yprm_get_theme_setting('code_before_body'))) {
      echo yprm_get_theme_setting('code_before_body');
    }
  }
  add_action( 'wp_footer', 'yprm_custom_footer_script', 500 );
}

/**
 * Header Class
 */

if (!function_exists('yprm_header_class')) {
  function yprm_header_class() {
    if (function_exists('yprm_get_theme_setting')) {
      $classes[] = 'header_' . yprm_get_theme_setting('header_style');
      $classes[] = yprm_get_theme_setting('header_color_mode');

      if(yprm_get_theme_setting('header_sticky') == 'false') {
        $classes[] = 'without-fixed';
      }

      if (yprm_get_theme_setting('header_space') == 'yes' || yprm_get_theme_setting('header_space') == 'true') {
        $classes[] = 'header-space-on';
      }

      return yprm_implode($classes);
    }
  }
}

/**
 * Color Switcher
 */

if (!function_exists('yprm_color_scheme_switcher')) {
  function yprm_color_scheme_switcher() {
    if (function_exists('yprm_get_theme_setting') && yprm_get_theme_setting('site_color_switcher') == 'true' ) {
    	ob_start();
    	?>

    	<div class="switch-site-scheme switcher-position-<?php echo esc_attr( yprm_get_theme_setting('site_color_switcher_pos', 'top-left') ); ?>">
	    	<div class="arrows">
				<div class="back">
					<i class="basic-ui-icon-left-arrow"></i>
					<i class="basic-ui-icon-left-arrow"></i>
				</div>
				<div class="next">
					<i class="basic-ui-icon-right-arrow"></i>
					<i class="basic-ui-icon-right-arrow"></i>
				</div>
			</div>
			<div class="button">
				<div class="labels">
					<span>Light</span>
					<span>Dark</span>
				</div>
			</div>
		</div>
		<?php
		echo ob_get_clean();
   	}
  }
  add_action('wp_footer', 'yprm_color_scheme_switcher');
}

add_filter('get_the_excerpt', 'shortcode_unautop');
add_filter('get_the_excerpt', 'do_shortcode');

/**
 * Get Browser Type
 */

if (!function_exists('novo_browser_body_class')) {
  function novo_browser_body_class($classes) {
    global $is_lynx, $is_gecko, $is_IE, $is_edge, $is_opera, $is_NS4, $is_safari, $is_chrome, $is_iphone;
    if ($is_lynx) {
      $classes[] = 'lynx';
    } elseif ($is_gecko) {
      $classes[] = 'gecko';
    } elseif ($is_opera) {
      $classes[] = 'opera';
    } elseif ($is_NS4) {
      $classes[] = 'ns4';
    } elseif ($is_safari) {
      $classes[] = 'safari';
    } elseif ($is_chrome) {
      $classes[] = 'chrome';
    } elseif ($is_edge) {
      $classes[] = 'edge';
    } elseif ($is_IE) {
      $classes[] = 'ie';
      if (preg_match('/MSIE ([0-9]+)([a-zA-Z0-9.]+)/', filter_input(INPUT_SERVER, 'HTTP_USER_AGENT'), $browser_version)) {
        $classes[] = 'ie' . $browser_version[1];
      }

    } else {
      $classes[] = 'unknown';
    }

    if ($is_iphone) {
      $classes[] = 'iphone';
    }

    $userAgent = filter_input(INPUT_SERVER, 'HTTP_USER_AGENT');

    if ($userAgent !== null && stristr($userAgent, "mac")) {
        $classes[] = 'osx';
    } elseif ($userAgent !== null && stristr($userAgent, "linux")) {
        $classes[] = 'linux';
    } elseif ($userAgent !== null && stristr($userAgent, "windows")) {
        $classes[] = 'windows';
    }
    return $classes;
  }
  add_filter('body_class', 'novo_browser_body_class');
}

/**
 * TinyMCE
 */

if (!function_exists('yprm_tiny_mce_add_formats')) {
  function yprm_tiny_mce_add_formats($settings) {

    $style_formats = array(
      array(
        'title' => esc_html__('Thin', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'fontWeight' => '100',
        ),
      ),
      array(
        'title' => esc_html__('Extra Light', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'fontWeight' => '200',
        ),
      ),
      array(
        'title' => esc_html__('Light', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'fontWeight' => '300',
        ),
      ),
      array(
        'title' => esc_html__('Regular', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'fontWeight' => '400',
        ),
      ),
      array(
        'title' => esc_html__('Medium', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'fontWeight' => '500',
        ),
      ),
      array(
        'title' => esc_html__('Semibold', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'fontWeight' => '600',
        ),
      ),
      array(
        'title' => esc_html__('Bold', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'fontWeight' => '700',
        ),
      ),
      array(
        'title' => esc_html__('Extra Bold', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'fontWeight' => '800',
        ),
      ),
      array(
        'title' => esc_html__('Black', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'fontWeight' => '900',
        ),
      ),
      array(
        'title' => esc_html__('Uppercase', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'textTransform' => 'uppercase',
        ),
      ),
      array(
        'title' => esc_html__('Lowercase', 'novo'),
        'inline' => 'span',
        'styles' => array(
          'textTransform' => 'lowercase',
        ),
      ),
      array(
        'title' => esc_html__('Button Style 1', 'novo'),
        'inline' => 'a',
        'classes' => 'button-style1',
        'wrapper' => true,
      ),
      array(
        'title' => esc_html__('Button Style 2', 'novo'),
        'inline' => 'a',
        'classes' => 'button-style2',
        'wrapper' => true,
      ),
    );

    $settings['style_formats'] = json_encode($style_formats);

    return $settings;
  }
  add_filter('tiny_mce_before_init', 'yprm_tiny_mce_add_formats');
}

if (!function_exists('yprm_tiny_mce_custom_fonts')) {
  function yprm_tiny_mce_custom_fonts($init) {
    global $novo_theme;

    $array = 'dd';

    /* if (isset($novo_theme) && !empty($novo_theme)) {
    if (isset($novo_theme['body-font-face']['font']) && !empty($novo_theme['body-font-face']['font'])) {
    $array .= $novo_theme['body-font-face']['font'] . '=' . $novo_theme['body-font-face']['font'] . ';';
    }
    } */

    /* $font_formats = isset($init['font_formats']) ? $init['font_formats'] : 'Andale Monos=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats'; */

    $init['fontsize_formats'] = "10px 11px 12px 13px 14px 15px 16px 17px 18px 19px 20px 21px 22px 23px 24px 25px 26px 27px 28px 29px 30px 32px 33px 34px 35px 36px 37px 38px 39px 40px";

    if (isset($array) && !empty($array)) {
      /* trim($array, ';');
      $custom_fonts = ';' . $array;

      $init['font_formats'] = $font_formats . $custom_fonts; */

      return $init;
    } else {
      return false;
    }
  }
  add_filter('tiny_mce_before_init', 'yprm_tiny_mce_custom_fonts');
}

/**
 * Right Click Disable
 */

if (!function_exists('yprm_right_click_disable')) {
  function yprm_right_click_disable() {
    if (function_exists('yprm_get_theme_setting') && yprm_get_theme_setting('right_click_disable') == 'true') {
      echo '<div class="right-click-disable-message main-row"><div class="container full-height">' . wp_kses_post(yprm_get_theme_setting('right_click_disable_message')) . '</div></div>';
    }
  }
  add_action('wp_footer', 'yprm_right_click_disable');
}

/**
 * Password Protected
 */

if (!function_exists('yprm_custom_password_form')) {
  function yprm_custom_password_form() {
    global $post;
    $label = 'pwbox-' . (empty($post->ID) ? rand() : $post->ID);
    $o = '<form class="protected-post-form" action="' . esc_url(site_url('wp-login.php?action=postpass', 'login_post')) . '" method="post">
      <div class="content-block">
        <div class="title">' . wp_kses(nl2br(yprm_get_theme_setting('protected_title')), 'post') . '</div>
        <div class="text">' . wp_kses(nl2br(yprm_get_theme_setting('protected_message')), 'post') . '</div>
      </div>
      <div class="form">
        <div>
          <input name="post_password" class="input" placeholder="' . esc_attr__('Type your passsword', 'novo') . '" id="' . $label . '" type="password" />
        </div>
        <button type="submit" name="Submit" class="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path d="M20.3617 10.609H19.1837V7.18464C19.1837 3.22303 15.9607 0 11.9991 0C8.03748 0 4.81445 3.22303 4.81445 7.18464V10.609H3.63648C2.95002 10.609 2.39355 11.1655 2.39355 11.8519V22.7569C2.39355 23.4434 2.95002 23.9999 3.63648 23.9999H20.3617C21.0482 23.9999 21.6047 23.4435 21.6047 22.7569V11.852C21.6047 11.1656 21.0482 10.609 20.3617 10.609ZM7.83208 7.18464C7.83208 4.88695 9.70141 3.01763 11.9991 3.01763C14.2968 3.01763 16.1661 4.88695 16.1661 7.18464V10.609H7.83208V7.18464ZM13.3536 17.7179V19.9471C13.3536 20.6952 12.7472 21.3016 11.9991 21.3016C11.251 21.3016 10.6446 20.6952 10.6446 19.9471V17.7179C10.1407 17.3182 9.81716 16.7011 9.81716 16.0079C9.81716 14.8029 10.794 13.8259 11.9991 13.8259C13.2042 13.8259 14.181 14.8029 14.181 16.0079C14.181 16.7011 13.8575 17.3183 13.3536 17.7179Z" />
            </g>
          </svg>
        </button>
      </div>
    </form>';
    return $o;
  }
  add_filter('the_password_form', 'yprm_custom_password_form');
}

/**
 * Hide Editor on Coming Soon
 */

if (!function_exists('yprm_hide_editor_on_coming_soon')) {
  function yprm_hide_editor_on_coming_soon() {
    if (isset($_GET['post'])) {
      $post_id = $_GET['post'];
    } elseif (isset($_POST['post_ID'])) {
      $post_id = $_POST['post_ID'];
    }

    if (!isset($post_id) || empty($post_id)) {
      return;
    }

    $template_file = get_post_meta($post_id, '_wp_page_template', true);

    if ($template_file == 'page-coming-soon.php') {
      remove_post_type_support('page', 'editor');
    }
  }
  add_action('admin_init', 'yprm_hide_editor_on_coming_soon');
}

/**
 * Site pagination.
 */

if (!function_exists('yprm_wp_corenavi')) {
  function yprm_wp_corenavi($max_count = '') {
    global $wp_query;
    $pages = '';
    if (isset($max_count) && $max_count > 0) {
      $max = $max_count;
    } else {
      $max = $wp_query->max_num_pages;
    }

    if (get_query_var('paged') != 0) {
      $paged = get_query_var('paged');
    } else {
      $paged = get_query_var('page');
    }

    if (!$current = $paged) {
      $current = 1;
    }

    $a['base'] = str_replace(999999999, '%#%', get_pagenum_link(999999999));
    $a['total'] = $max;
    $a['current'] = $current;

    $a['mid_size'] = 5;
    $a['end_size'] = 1;
    $a['prev_text'] = '<i class="base-icon-back"></i>';
    $a['next_text'] = '<i class="base-icon-next-1"></i>';
    $a['type'] = 'list';
    $a['add_args'] = false;

    $html = '';

    if ($max > 1) {
      $html .= '<div class="pagination">';
    }
    $html .= paginate_links($a);
    if ($max > 1) {
      $html .= '</div>';
    }

    return $html;
  }
}

/**
 * Let to Num
 */

if (!function_exists('yprm_let_to_num')) {
  function yprm_let_to_num($size) {
    $l = substr($size, -1);
    $ret = substr($size, 0, -1);
    $byte = 1024;

    switch (strtoupper($l)) {
    case 'P':
      $ret *= 1024;
    case 'T':
      $ret *= 1024;
    case 'G':
      $ret *= 1024;
    case 'M':
      $ret *= 1024;
    case 'K':
      $ret *= 1024;
    }
    return $ret;
  }
}

/**
 * Build Site Logo
 */

if (!function_exists('yprm_site_logo')) {
  function yprm_site_logo() {
    $colored = false;
    $html = '';

    if (function_exists('yprm_get_theme_setting')) {
      if (
        is_array(yprm_get_theme_setting('light_logo')) &&
        !empty(yprm_get_theme_setting('light_logo')['background-image']) &&
        is_array(yprm_get_theme_setting('dark_logo')) &&
        !empty(yprm_get_theme_setting('dark_logo')['background-image'])
      ) {
        $colored = true;
      }

      if (is_array(yprm_get_theme_setting('light_logo')) && !empty(yprm_get_theme_setting('light_logo')['background-image'])) {

        $html .= '<img' . (($colored) ? ' class="light"' : '') . ' src="' . esc_url(yprm_get_theme_setting('light_logo')['background-image']) . '" alt="' . esc_attr(get_bloginfo('name')) . '">';
      }

      if (is_array(yprm_get_theme_setting('dark_logo')) && !empty(yprm_get_theme_setting('dark_logo')['background-image'])) {

        $html .= '<img' . (($colored) ? ' class="dark"' : '') . ' src="' . esc_url(yprm_get_theme_setting('dark_logo')['background-image']) . '" alt="' . esc_attr(get_bloginfo('name')) . '">';
      }

      if (empty($html)) {
        if (!empty(yprm_get_theme_setting('logo_text'))) {
          $html = '<span>' . wp_kses_post(yprm_get_theme_setting('logo_text')) . '</span>';
        } else {
          $html = '<span>' . wp_kses_post(get_bloginfo('name')) . '</span>';
        }
      }

    } else {
      $html = '<span>' . wp_kses_post(get_bloginfo('name')) . '</span>';
    }

    return '<a href="' . esc_url(home_url('/')) . '" data-magic-cursor="link">' . $html . '</a>';
  }
}

if (!function_exists('yprm_site_footer_logo')) {
  function yprm_site_footer_logo() {
    $colored = false;
    $html = '';

    if (function_exists('yprm_get_theme_setting')) {
      if (
        is_array(yprm_get_theme_setting('footer_light_logo')) &&
        !empty(yprm_get_theme_setting('footer_light_logo')['background-image']) &&
        is_array(yprm_get_theme_setting('footer_dark_logo')) &&
        !empty(yprm_get_theme_setting('footer_dark_logo')['background-image'])
      ) {
        $colored = true;
      }

      if (is_array(yprm_get_theme_setting('footer_light_logo')) && !empty(yprm_get_theme_setting('footer_light_logo')['background-image'])) {

        $html .= '<img' . (($colored) ? ' class="light"' : '') . ' src="' . esc_url(yprm_get_theme_setting('footer_light_logo')['background-image']) . '" alt="' . esc_attr(get_bloginfo('name')) . '">';
      }

      if (is_array(yprm_get_theme_setting('footer_dark_logo')) && !empty(yprm_get_theme_setting('footer_dark_logo')['background-image'])) {

        $html .= '<img' . (($colored) ? ' class="dark"' : '') . ' src="' . esc_url(yprm_get_theme_setting('footer_dark_logo')['background-image']) . '" alt="' . esc_attr(get_bloginfo('name')) . '">';
      }
    }

    
    if($html) {
      return '<a href="' . esc_url(home_url('/')) . '" data-magic-cursor="link">' . $html . '</a>';
    } else {
      return yprm_site_logo();
    }
  }
}

/**
 * WC Minicart
 */

if (!function_exists('yprm_wc_minicart')) {
  function yprm_wc_minicart() {
    if (!class_exists('WooCommerce')) {
      return;
    }

    global $woocommerce;
    $count = $woocommerce->cart->cart_contents_count;
    ?>
    <div class="header-minicart woocommerce header-minicart-novo">
      <?php if ($count == 0) { ?>
        <div class="hm-count empty"><i class="base-icon-minicart"></i><span><?php echo esc_html($count) ?></span></div>
      <?php } else { ?>
        <a class="hm-count" href="<?php echo esc_url(wc_get_cart_url()) ?>" data-magic-cursor="link-small"><i class="base-icon-minicart"></i><span><?php echo esc_html($count) ?></span></a>
      <?php } ?>
      <div class="minicart-wrap">
        <?php woocommerce_mini_cart(); ?>
      </div>
    </div>
    <?php
}
}

/**
 * Build Social Links
 */

if (!function_exists('yprm_build_social_links')) {
  function yprm_build_social_links($type = false, $items = false) {
    $html = '';
    $default_icons = array(
      '500px' => array(
        'icon' => 'fab fa-500px',
        'title' => esc_html__('500px', 'novo'),
        'title_small' => esc_html__('500px', 'novo'),
      ),
      'amazon' => array(
        'icon' => 'fab fa-amazon',
        'title' => esc_html__('Amazon', 'novo'),
        'title_small' => esc_html__('az', 'novo'),
      ),
      'app-store' => array(
        'icon' => 'fab fa-app-store',
        'title' => esc_html__('App Store', 'novo'),
        'title_small' => esc_html__('as', 'novo'),
      ),
      'behance' => array(
        'icon' => 'fab fa-behance',
        'title' => esc_html__('Behance', 'novo'),
        'title_small' => esc_html__('bh', 'novo'),
      ),
      'blogger' => array(
        'icon' => 'fab fa-blogger-b',
        'title' => esc_html__('Blogger', 'novo'),
        'title_small' => esc_html__('bg', 'novo'),
      ),
      'codepen' => array(
        'icon' => 'fab fa-codepen',
        'title' => esc_html__('Codepen', 'novo'),
        'title_small' => esc_html__('cp', 'novo'),
      ),
      'digg' => array(
        'icon' => 'fab fa-digg',
        'title' => esc_html__('Digg', 'novo'),
        'title_small' => esc_html__('dg', 'novo'),
      ),
      'dribbble' => array(
        'icon' => 'fab fa-dribbble',
        'title' => esc_html__('Dribbble', 'novo'),
        'title_small' => esc_html__('db', 'novo'),
      ),
      'dropbox' => array(
        'icon' => 'fab fa-dropbox',
        'title' => esc_html__('Dropbox', 'novo'),
        'title_small' => esc_html__('db', 'novo'),
      ),
      'ebay' => array(
        'icon' => 'fab fa-ebay',
        'title' => esc_html__('Ebay', 'novo'),
        'title_small' => esc_html__('eb', 'novo'),
      ),
      'facebook' => array(
        'icon' => 'fab fa-facebook-f',
        'title' => esc_html__('Facebook', 'novo'),
        'title_small' => esc_html__('fb', 'novo'),
      ),
      'flickr' => array(
        'icon' => 'fab fa-flickr',
        'title' => esc_html__('Flickr', 'novo'),
        'title_small' => esc_html__('fl', 'novo'),
      ),
      'foursquare' => array(
        'icon' => 'fab fa-foursquare',
        'title' => esc_html__('Foursquare', 'novo'),
        'title_small' => esc_html__('fs', 'novo'),
      ),
      'github' => array(
        'icon' => 'fab fa-github',
        'title' => esc_html__('GitHub', 'novo'),
        'title_small' => esc_html__('gh', 'novo'),
      ),
      'instagram' => array(
        'icon' => 'fab fa-instagram',
        'title' => esc_html__('Instagram', 'novo'),
        'title_small' => esc_html__('in', 'novo'),
      ),
      'itunes' => array(
        'icon' => 'fab fa-itunes-note',
        'title' => esc_html__('Itunes', 'novo'),
        'title_small' => esc_html__('it', 'novo'),
      ),
      'kickstarter' => array(
        'icon' => 'fab fa-kickstarter-k',
        'title' => esc_html__('Kickstarter', 'novo'),
        'title_small' => esc_html__('ks', 'novo'),
      ),
      'linkedin' => array(
        'icon' => 'fab fa-linkedin-in',
        'title' => esc_html__('LinkedIn', 'novo'),
        'title_small' => esc_html__('li', 'novo'),
      ),
      'mailchimp' => array(
        'icon' => 'fab fa-mailchimp',
        'title' => esc_html__('Mailchimp', 'novo'),
        'title_small' => esc_html__('mc', 'novo'),
      ),
      'mixcloud' => array(
        'icon' => 'fab fa-mixcloud',
        'title' => esc_html__('MixCloud', 'novo'),
        'title_small' => esc_html__('mc', 'novo'),
      ),
      'windows' => array(
        'icon' => 'fab fa-microsoft',
        'title' => esc_html__('Windows', 'novo'),
        'title_small' => esc_html__('wd', 'novo'),
      ),
      'odnoklassniki' => array(
        'icon' => 'fab fa-odnoklassniki',
        'title' => esc_html__('Odnoklassniki', 'novo'),
        'title_small' => esc_html__('od', 'novo'),
      ),
      'paypal' => array(
        'icon' => 'fab fa-paypal',
        'title' => esc_html__('PayPal', 'novo'),
        'title_small' => esc_html__('pp', 'novo'),
      ),
      'periscope' => array(
        'icon' => 'fab fa-periscope',
        'title' => esc_html__('Periscope', 'novo'),
        'title_small' => esc_html__('ps', 'novo'),
      ),
      'openid' => array(
        'icon' => 'fab fa-openid',
        'title' => esc_html__('OpenID', 'novo'),
        'title_small' => esc_html__('oi', 'novo'),
      ),
      'pinterest' => array(
        'icon' => 'fab fa-pinterest',
        'title' => esc_html__('Pinterest', 'novo'),
        'title_small' => esc_html__('pr', 'novo'),
      ),
      'reddit' => array(
        'icon' => 'fab fa-reddit-alien',
        'title' => esc_html__('Reddit', 'novo'),
        'title_small' => esc_html__('rd', 'novo'),
      ),
      'skype' => array(
        'icon' => 'fab fa-skype',
        'title' => esc_html__('Skype', 'novo'),
        'title_small' => esc_html__('sk', 'novo'),
      ),
      'snapchat' => array(
        'icon' => 'fab fa-snapchat-ghost',
        'title' => esc_html__('Snapchat', 'novo'),
        'title_small' => esc_html__('sc', 'novo'),
      ),
      'soundcloud' => array(
        'icon' => 'fab fa-soundcloud',
        'title' => esc_html__('SoundCloud', 'novo'),
        'title_small' => esc_html__('sc', 'novo'),
      ),
      'spotify' => array(
        'icon' => 'fab fa-spotify',
        'title' => esc_html__('Spotify', 'novo'),
        'title_small' => esc_html__('sp', 'novo'),
      ),
      'stack-overflow' => array(
        'icon' => 'fab fa-stack-overflow',
        'title' => esc_html__('Stack Overflow', 'novo'),
        'title_small' => esc_html__('so', 'novo'),
      ),
      'steam' => array(
        'icon' => 'fab fa-steam-square',
        'title' => esc_html__('Steam', 'novo'),
        'title_small' => esc_html__('st', 'novo'),
      ),
      'stripe' => array(
        'icon' => 'fab fa-stripe',
        'title' => esc_html__('Stripe', 'novo'),
        'title_small' => esc_html__('st', 'novo'),
      ),
      'telegram' => array(
        'icon' => 'fab fa-telegram-plane',
        'title' => esc_html__('Telegram', 'novo'),
        'title_small' => esc_html__('tl', 'novo'),
      ),
      'threads' => array(
        'icon' => 'fab fa-threads',
        'title' => esc_html__('Threads', 'novo'),
        'title_small' => esc_html__('th', 'novo'),
      ),
      'tumblr' => array(
        'icon' => 'fab fa-tumblr',
        'title' => esc_html__('Tumblr', 'novo'),
        'title_small' => esc_html__('tu', 'novo'),
      ),
      'tiktok' => array(
        'icon' => 'fab fa-tiktok',
        'title' => esc_html__('TikTok', 'novo'),
        'title_small' => esc_html__('tt', 'novo'),
      ),
      'twitter' => array(
        'icon' => 'fab fa-x-twitter',
        'title' => esc_html__('Twitter', 'novo'),
        'title_small' => esc_html__('tw', 'novo'),
      ),
      'viber' => array(
        'icon' => 'fab fa-viber',
        'title' => esc_html__('Viber', 'novo'),
        'title_small' => esc_html__('vi', 'novo'),
      ),
      'vimeo' => array(
        'icon' => 'fab fa-vimeo-v',
        'title' => esc_html__('Vimeo', 'novo'),
        'title_small' => esc_html__('vi', 'novo'),
      ),
      'vk' => array(
        'icon' => 'fab fa-vk',
        'title' => esc_html__('VK', 'novo'),
        'title_small' => esc_html__('vk', 'novo'),
      ),
      'whatsapp' => array(
        'icon' => 'fab fa-whatsapp',
        'title' => esc_html__('Whatsapp', 'novo'),
        'title_small' => esc_html__('wa', 'novo'),
      ),
      'yahoo' => array(
        'icon' => 'fab fa-yahoo',
        'title' => esc_html__('Yahoo', 'novo'),
        'title_small' => esc_html__('ya', 'novo'),
      ),
      'yelp' => array(
        'icon' => 'fab fa-yelp',
        'title' => esc_html__('Yelp', 'novo'),
        'title_small' => esc_html__('ye', 'novo'),
      ),
      'yoast' => array(
        'icon' => 'fab fa-yoast',
        'title' => esc_html__('Yoast', 'novo'),
        'title_small' => esc_html__('yo', 'novo'),
      ),
      'youtube' => array(
        'icon' => 'fab fa-youtube',
        'title' => esc_html__('YouTube', 'novo'),
        'title_small' => esc_html__('yt', 'novo'),
      ),
    );

    $square_icons = $circle_icons = $default_icons;

    $square_icons['app-store']['icon'] = 'fab fa-app-store-ios';
    $square_icons['behance']['icon'] = 'fab fa-behance-square';
    $square_icons['blogger']['icon'] = 'fab fa-blogger';
    $square_icons['dribbble']['icon'] = 'fab fa-dribbble-square';
    $square_icons['facebook']['icon'] = 'fab fa-facebook-square';
    $square_icons['github']['icon'] = 'fab fa-github-square';
    $square_icons['google-plus']['icon'] = 'fab fa-google-plus-square';
    $square_icons['itunes']['icon'] = 'fab fa-itunes';
    $square_icons['kickstarter']['icon'] = 'fab fa-kickstarter';
    $square_icons['linkedin']['icon'] = 'fab fa-linkedin';
    $square_icons['odnoklassniki']['icon'] = 'fab fa-odnoklassniki-square';
    $square_icons['pinterest']['icon'] = 'fab fa-pinterest-square';
    $square_icons['reddit']['icon'] = 'fab fa-reddit-square';
    $square_icons['tumblr']['icon'] = 'fab fa-tumblr-square';
    $square_icons['twitter']['icon'] = 'fab fa-twitter-square';
    $square_icons['vimeo']['icon'] = 'fab fa-vimeo-square';
    $square_icons['whatsapp']['icon'] = 'fab fa-whatsapp-square';
    $square_icons['youtube']['icon'] = 'fab fa-youtube-square';

    $circle_icons['behance']['icon'] = 'glypho-behance-logo-button';
    $circle_icons['dribbble']['icon'] = 'glypho-dribble-logo-button';
    $circle_icons['facebook']['icon'] = 'glypho-facebook-logo-button';
    $circle_icons['google-plus']['icon'] = 'glypho-google-plus-logo-button';
    $circle_icons['instagram']['icon'] = 'glypho-instagram-logo';
    $circle_icons['linkedin']['icon'] = 'glypho-linkedin-logo-button';
    $circle_icons['tumblr']['icon'] = 'glypho-tumblr-logo-button';
    $circle_icons['twitter']['icon'] = 'glypho-twitter-logo-button';

    if (function_exists('yprm_get_theme_setting')) {
      $items_array = array();
      $target = yprm_get_theme_setting('social_target');
      if (!$items) {
        $n = 0;
        while ($n < 7) {
          $n++;
          if (!empty(yprm_get_theme_setting('social_icon' . $n)) && !empty(yprm_get_theme_setting('social_link' . $n))) {
            array_push($items_array, array(
              'type' => yprm_get_theme_setting('social_icon' . $n),
              'url' => yprm_get_theme_setting('social_link' . $n),
            ));
          }
        }

        if (count($items_array) == 0) {
          return false;
        }
      } elseif (is_array($items) && count($items) > 0) {
        $items_array = $items;
      }

      if (!$type) {
        foreach ($items_array as $item) {
          if(!isset($default_icons[$item['type']]['icon']) || empty($default_icons[$item['type']]['icon'])) {
            continue;
          }
          $icon = $default_icons[$item['type']]['icon'];
          $html .= '<a href="' . esc_url($item['url']) . '" target=' . esc_attr($target) . '"><i class="' . esc_attr($icon) . '"></i></a>';
        }
        return $html;
      } elseif ($type == 'square') {
        foreach ($items_array as $item) {
          if(!isset($square_icons[$item['type']]['icon']) || empty($square_icons[$item['type']]['icon'])) {
            continue;
          }
          $icon = $square_icons[$item['type']]['icon'];
          $html .= '<a href="' . esc_url($item['url']) . '" target=' . esc_attr($target) . '"><i class="' . esc_attr($icon) . '"></i></a>';
        }
        return $html;
      } elseif ($type == 'with-label') {
        foreach ($items_array as $item) {
          if(!isset($default_icons[$item['type']]['icon']) || empty($default_icons[$item['type']]['icon'])) {
            continue;
          }
          $icon = $default_icons[$item['type']]['icon'];
          $html .= '<a href="' . esc_url($item['url']) . '" class="item" target=' . esc_attr($target) . '"><i class="' . esc_attr($icon) . '"></i><span>' . strip_tags($default_icons[$item['type']]['title']) . '</span></a>';
        }
        return $html;
      } elseif ($type == 'label') {
        foreach ($items_array as $item) {
          if(!isset($square_icons[$item['type']]['icon']) || empty($square_icons[$item['type']]['icon'])) {
            continue;
          }
          $icon = $square_icons[$item['type']]['icon'];
          $html .= '<a href="' . esc_url($item['url']) . '" target=' . esc_attr($target) . '"><span>' . strip_tags($default_icons[$item['type']]['title']) . '</span></a>';
        }
        return $html;
      } elseif ($type == 'circle') {
        foreach ($items_array as $item) {
          if(!isset($circle_icons[$item['type']]['icon']) || empty($circle_icons[$item['type']]['icon'])) {
            continue;
          }
          $icon = $circle_icons[$item['type']]['icon'];
          $html .= '<a href="' . esc_url($item['url']) . '" target=' . esc_attr($target) . '"><i class="' . esc_attr($icon) . '"></i></a>';
        }
        return $html;
      } elseif ($type == 'circle-with-label') {
        foreach ($items_array as $item) {
          if(!isset($circle_icons[$item['type']]['icon']) || empty($circle_icons[$item['type']]['icon'])) {
            continue;
          }
          $icon = $circle_icons[$item['type']]['icon'];
          $html .= '<a href="' . esc_url($item['url']) . '" target=' . esc_attr($target) . '"><i class="' . esc_attr($icon) . '"></i><span>' . strip_tags($default_icons[$item['type']]['title']) . '</span></a>';
        }
        return $html;
      }

    } else {
      return;
    }

  }
}

/**
 * Inline JS
 */

if (!function_exists('novo_inline_js')) {
  function novo_inline_js($js = false) {
    if (empty($js)) {
      return false;
    }

    $js = "jQuery(document).ready(function (jQuery) {
      $js
    });";

    wp_enqueue_script('novo-script');
    wp_add_inline_script('novo-script', $js);
  }
  add_action('novo_inline_js', 'novo_inline_js');
}

/**
 * Edit Archive Title
 */

if (!function_exists('yprm_edit_archive_title')) {
  function yprm_edit_archive_title($title) {
    if (function_exists('yprm_get_theme_setting') && yprm_get_theme_setting('cat_prefix') == 'false') {
      return preg_replace('~^[^:]+: ~', '', $title);
    } else {
      return $title;
    }
  }

  add_filter('get_the_archive_title', 'yprm_edit_archive_title');
}

/**
 * Implode
 */

if (!function_exists('yprm_implode')) {
  function yprm_implode($array = array(), $before = ' ', $separator = ' ') {
    return $before . implode($separator, $array);
  }
}

/**
 * TypeKit Ajax
 */

if (!function_exists('typekit_ajax')) {
  function typekit_ajax($id = '') {

    if (!empty($_POST['id'])) {
      $id = $_POST['id'];
    } elseif (!$id) {
      return false;
    }
    if (class_exists('Typekit')) {
      $typekit = new Typekit();
      $fonts_array = $typekit->get($id);
      $typekit_html = '';

      $font_weight_change_array = array(
        'search' => array('n1', 'i1', 'n2', 'i2', 'n3', 'i3', 'n4', 'i4', 'n5', 'i5', 'n6', 'i6', 'n7', 'i7', 'n8', 'i8', 'n9', 'i9'),
        'replace' => array('Thin', 'Thin Italic', 'ExtraLight', 'ExtraLight Italic', 'Light', 'Light Italic', 'Regular', 'Italic', 'Medium', 'Medium Italic', 'SemiBold', 'SemiBold Italic', 'Bold', 'Bold Italic', 'ExtraBold', 'ExtraBold Italic', 'Ultra', 'Ultra Italic'),
      );
      if (is_array($fonts_array)) {
        $typekit_html .= '<link rel="stylesheet" href="https://use.typekit.net/' . strip_tags($id) . '.css">';
        $typekit_html .= '<div class="redux-typekit-block">';
        foreach ($fonts_array['kit']['families'] as $font) {
          $typekit_html .= '<div class="item">';
          $typekit_html .= '<div class="label"><strong>' . esc_html__('Font Family:', 'novo') . '</strong> ' . strip_tags($font['name']) . '</div>';
          $typekit_html .= '<div class="value"><strong>' . esc_html__('Font Weights:', 'novo') . '</strong> ' . strip_tags(str_replace($font_weight_change_array['search'], $font_weight_change_array['replace'], implode(', ', $font['variations']))) . '</div>';
          $typekit_html .= '<div class="font-example" style="font-family: \'' . esc_attr($font['slug']) . '\'">' . esc_html__('The quick brown fox jumps over the lazy dog', 'novo') . '</div>';
          $typekit_html .= '</div>';
        }
        $typekit_html .= '</div>';
      } else {
        $typekit_html .= '<div>' . esc_html__('Nothing Found', 'novo') . '</div>';
      }

      echo wp_kses($typekit_html, array(
        'link' => array(
          'rel' => true,
          'href' => true,
        ),
        'div' => array(
          'class' => true,
        ),
        'strong' => array(
          'class' => true,
        ),
      ));
    }
  }
  add_action('wp_ajax_typekit_ajax', 'typekit_ajax');
  add_action('wp_ajax_nopriv_typekit_ajax', 'typekit_ajax');
}

class Child_Wrap extends Walker_Nav_Menu {
  public function start_lvl(&$output, $depth = 0, $args = array()) {
    $indent = str_repeat("\t", $depth);
    $output .= "\n$indent<ul class=\"sub-menu\"><li class=\"back multimedia-icon-back\"></li>\n";
  }
  public function end_lvl(&$output, $depth = 0, $args = array()) {
    $indent = str_repeat("\t", $depth);
    $output .= "$indent</ul>\n";
  }
}

add_action('vc_before_init', 'yprm_vc_set_as_theme');
function yprm_vc_set_as_theme() {
  if (function_exists('vc_set_as_theme')) {
    vc_set_as_theme();
  }
}

/**
 * Page Using Elementor
 */

if(!function_exists('yprm_page_using_elementor')) {
  function yprm_page_using_elementor($id = false) {
    if(!$id) $id = get_the_ID();

    if(class_exists('Elementor\Plugin')) {
      return Elementor\Plugin::$instance->documents->get( $id )->is_built_with_elementor();
    }

    return false;
  }
}

/**
 * Get Image Popup Atts
 */

if(!function_exists('yprm_get_image_popup_atts')) {
  function yprm_get_image_popup_atts($id, $index) {
    $img_full_array = wp_get_attachment_image_src($id, 'full');
    $img_info = get_post($id);

    $img_info = array(
      'title' => $img_info->post_title,
      'desc' => $img_info->post_content
    );

    $popup_array = [];
  
    $popup_array['image'] = [
      'url' => $img_full_array[0],
      'w' => $img_full_array[1],
      'h' => $img_full_array[2]
    ];
    $popup_array['post_id'] = $id;

    if(!empty($img_info['title'])) {
      $popup_array['title'] = $img_info['title'];
    }
    if(!empty($img_info['desc'])) {
      $popup_array['desc'] = mb_strimwidth($img_info['desc'], 0, yprm_get_theme_setting('popup_desc_size'), '...');
    }

    return 'data-popup-json="'.esc_attr(json_encode($popup_array)).'" data-id="'.esc_attr($index).'"';
  }
}