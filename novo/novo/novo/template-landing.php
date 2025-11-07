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
Template Name: Landing page
*/

get_header(); ?>

	<main class="main-row">
    <?php if(!yprm_page_using_elementor()) { ?>
      <div class="container">
    <?php } ?>

      <?php while ( have_posts() ) : the_post();
      
				the_content();

			endwhile; ?>

    <?php if(!yprm_page_using_elementor()) { ?>
			</div>
		<?php } ?>
	</main>

<?php get_footer();