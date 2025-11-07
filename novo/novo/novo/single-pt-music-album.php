<?php
/**
 * The template for displaying all single posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package Sansara
 */

get_header(); ?>

	<main class="main-row">
		<div class="container">
			<?php while ( have_posts() ) : the_post(); ?>
				<div id="post-<?php the_ID(); ?>" <?php post_class() ?>>
					<?php 
						if(!class_exists('PT_Music_Album_Plugin')) {
							return false;
						}
						$id = get_the_ID();
						$item = get_post($id);
						$thumb = get_post_meta( $id, '_thumbnail_id', true );

						$album_details_array = get_post_meta( $id, 'pt_music_album_details_meta', true );

						$shop_buttons = 'yes';

						if($album_details_array['download_link'] != 'default') {
							$shop_buttons = $album_details_array['download_link'];
						}

						if(!empty($album_details_array['date'])) {
							$date = mysql2date( get_option( 'date_format' ), $album_details_array['date'] );
						} else {
							$date = get_the_date();
						}
					?>
					<div class="site-content">
						<div class="row">
						<?php if(!empty($thumb) && yprm_get_theme_setting('blog_feature_image') == 'show') { ?>
							<div class="col-12 col-sm-6">
								<div class="post-img"><?php echo wp_kses_post(wp_get_attachment_image($thumb, '')); ?></div>
							</div>
							<div class="col-12 col-sm-6">
						<?php } else { ?>
							<div class="col-12">
						<?php } ?>
								<h1 class="h2 page-title"><?php echo esc_html(single_post_title()); ?></h1>
								<div class="blog-detail">
									<div class="date"><i class="ui-interface-calendar"></i> <span><?php echo $date ?></span></div>
								</div>
								<div class="post-content"><?php the_content() ?></div>
								<?php if($shop_buttons == 'yes' && (!empty($album_details_array['apple_music']) || !empty($album_details_array['google_play']) || !empty($album_details_array['deezer']) || !empty($album_details_array['spotify']))) { ?>
									<div class="row">
										<?php if(!empty($album_details_array['apple_music'])) { ?>
											<div class="col-12 col-sm-6">
												<a href="<?php echo esc_url($album_details_array['apple_music']) ?>" class="app-button app-store">
													<span class="t"><?php echo esc_html__( 'Download From', 'novo' ) ?></span>
													<span class="l"><?php echo esc_html__( 'Apple Music', 'novo' ) ?></span>
												</a>
											</div>
										<?php } if(!empty($album_details_array['google_play'])) { ?>
											<div class="col-12 col-sm-6">
												<a href="<?php echo esc_url($album_details_array['google_play']) ?>" class="app-button google-play">
													<span class="t"><?php echo esc_html__( 'Download From', 'novo' ) ?></span>
													<span class="l"><?php echo esc_html__( 'YouTube Music', 'novo' ) ?></span>
												</a>
											</div>
										<?php } if(!empty($album_details_array['deezer'])) { ?>
											<div class="col-12 col-sm-6">
												<a href="<?php echo esc_url($album_details_array['deezer']) ?>" class="app-button deezer">
													<span class="t"><?php echo esc_html__( 'Listen On', 'novo' ) ?></span>
													<span class="l"><?php echo esc_html__( 'Deezer', 'novo' ) ?></span>
												</a>
											</div>
										<?php } if(!empty($album_details_array['spotify'])) { ?>
											<div class="col-12 col-sm-6">
												<a href="<?php echo esc_url($album_details_array['spotify']) ?>" class="app-button spotify">
													<span class="t"><?php echo esc_html__( 'Available On', 'novo' ) ?></span>
													<span class="l"><?php echo esc_html__( 'Spotify', 'novo' ) ?></span>
												</a>
											</div>
										<?php } ?>
									</div>
								<?php } ?>
							</div>
						</div>
						<?php echo do_shortcode('[pt_music_album_shortcode cover="off"]') ?>
					</div>
				</div>
				<?php if ( comments_open() || get_comments_number() ) :
					comments_template();
				endif; ?>
			<?php endwhile; ?>
		</div>
	</main>

<?php
get_footer();
