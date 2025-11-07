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
 * @package novo
 */

/*
Template Name: Page with sidebar
*/

get_header(); ?>

	<main class="main-row">
		<div class="container">
			
			<?php
			the_title( '<div class="page-title"><h1 class="h2">', '</h1></div>' );
			
			if(is_active_sidebar('blog-sidebar')) {
				echo '<div class="row">';
				echo '<div class="col-12 col-md-8">';
			}

				while ( have_posts() ) : the_post();

					the_content();

				endwhile;

			if(is_active_sidebar('blog-sidebar')) {
				echo '</div>';
				echo '<div class="s-sidebar col-12 col-md-4">';
					echo '<div class="w">';
						dynamic_sidebar('blog-sidebar');
					echo '</div>';
				echo '</div>';
				echo '</div>';
			};
			?>

		</div>
	</main>

<?php get_footer();