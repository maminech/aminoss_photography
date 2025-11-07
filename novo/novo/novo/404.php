<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 * @package Novo
 */

$bg = '';

if(function_exists('yprm_get_image')) {
  $bg = yprm_get_image(yprm_get_theme_setting('404_bg')['media']['id'], 'bg');
}

get_header(); ?>

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
				<div class="banner banner-404 white">
					<div class="item tac" style="<?php echo esc_attr($bg) ?>">
					<div class="container">
						<div class="cell middle">
							<?php if(!empty(yprm_get_theme_setting('404_page_heading'))) { ?>
								<h1 class="b-404-heading"><?php echo wp_kses_post(yprm_get_theme_setting('404_page_heading')) ?></h1>
							<?php } if(!empty(yprm_get_theme_setting('404_page_desc'))) { ?>
								<p><?php echo wp_kses_post(yprm_get_theme_setting('404_page_desc')) ?></p>
							<?php } ?>
							<a href="<?php echo esc_url(home_url('/')) ?>" class="button-style1"><?php echo esc_html__('GET BACK HOME', 'novo') ?></a>
						</div>
					</div>
				</div>
			</div>
			<!-- END Banner -->
		</div>
	</section>

<?php
get_footer('empty');
