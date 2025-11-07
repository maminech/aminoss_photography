<?php
/**
 * The template for displaying all pages.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site may use a
 * different template.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package Novo
 */

/*
Template Name: Coming soon page
*/

$bg = '';
if(function_exists('yprm_get_image')) {
  $bg = yprm_get_image(yprm_get_theme_setting('coming_soon_bg')['media']['id'], 'bg');
}

$id = uniqid('countdown-');

if(!isset($maintenance_mode)) {
  get_header(); 

  global $novo_theme;

  if(isset($novo_theme['coming_soon_date']) && !empty($novo_theme['coming_soon_date'])) {
    $date_array = explode('/', $novo_theme['coming_soon_date']);
    $month = $date_array[0]-1;
    $day = $date_array[1];
    $year = $date_array[2];

    $js = "var ts = new Date($year, $month, $day);

    if(jQuery('.$id').length > 0){
      jQuery('.$id').countdown({
        timestamp	: ts,
        callback	: function(days, hours, minutes, seconds){
        }
      });
    }";

    wp_enqueue_script( 'countdown', get_parent_theme_file_uri() . '/js/jquery.countdown.js', array('jquery'), '1.0', true );
    do_action('novo_inline_js', $js);
  }
}
?>

<section class="main-row">
	<div class="container-fluid no-padding">
		<!-- Banner -->
		<div class="banner-area external-indent">
			<div class="banner-social-buttons">
			    <div class="links">
			    	<?php if(yprm_get_theme_setting('social_buttons_content')) { ?>
						<?php echo yprm_get_theme_setting('social_buttons_content') ?>
					<?php } ?>
			    </div>
			</div>
			<div class="banner banner-coming-soon white">
				<div class="item tac" style="<?php echo esc_attr($bg) ?>">
				<div class="container">
					<div class="cell middle">
						<div id="countdown" class="<?php echo esc_attr($id) ?> medium"></div>
						<?php if(!empty(yprm_get_theme_setting('coming_soon_heading'))) { ?>
							<h1 class="b-coming-heading"><?php echo wp_kses_post(yprm_get_theme_setting('coming_soon_heading')) ?></h1>
						<?php } if(yprm_get_theme_setting('coming_soon_subscribe_code')) { ?>
							<p><?php echo wp_kses_post(yprm_get_theme_setting('coming_soon_subscribe_desc')) ?></p>
							<div class="tac"><?php echo do_shortcode(yprm_get_theme_setting('coming_soon_subscribe_code')) ?></div>
						<?php } ?>
					</div>
				</div>
			</div>
		</div>
		<!-- END Banner -->
	</div>
</section>
<?php 
if(!isset($maintenance_mode)) {
  get_footer('empty');
}
