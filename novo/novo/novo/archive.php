<?php
/**
 * The template for displaying archive pages
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package Novo
 */

get_header(); ?>

	<main class="main-row">
		<div class="container">

		<?php
		if ( have_posts() ) : ?>

			<div class="heading-decor line">
				<?php the_archive_title( '<h2>', '</h2>' ); ?>
			</div>
			
			<?php
			/* Start the Loop */
			if(get_post_type() == 'pt-portfolio') {
				if(yprm_get_theme_setting('project_in_popup') == 'yes') {
					$css_class = ' popup-gallery';
				} else {
					$css_class = '';
				}
        global $loop_index;

        $loop_index = 0;
				echo '<div class="portfolio-items row portfolio-type-grid portfolio_hover_type_1'.esc_attr($css_class).'">';
			} else {
				echo '<div class="blog-items row blog-type-'.yprm_get_theme_setting('blog_type').'">';
			}

			while ( have_posts() ) : the_post();

				/*
				 * Include the Post-Format-specific template for the content.
				 * If you want to override this in a child theme, then include a file
				 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
				 */
				get_template_part( 'template-parts/content', get_post_type() );

			endwhile;

			echo '</div>';
			
			if (function_exists('yprm_wp_corenavi')) {
				echo yprm_wp_corenavi();
			} else {
				wp_link_pages(); 
			};

		else :

			get_template_part( 'template-parts/content', 'none' );

		endif; ?>

		</div>
	</main>

<?php
get_footer();
