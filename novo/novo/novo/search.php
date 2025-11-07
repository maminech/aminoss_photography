<?php
/**
 * The template for displaying search results pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#search-result
 *
 * @package Novo
 */

get_header(); ?>

	<main class="main-row wrap-overlay">
		<div class="container">

		<?php
		if ( have_posts() ) : ?>

			<div class="heading-decor">
				<h1 class="h2"><?php echo esc_html__('Search page', 'novo'); ?></h1>
			</div>
			<div class="heading-decor">
				<h4><span><?php printf( esc_html__( 'Search Results for: %s', 'novo' ), get_search_query() ); ?></span></h4>
			</div>
			

			<?php
			echo '<div class="blog-items row blog-type-horizontal">';

			/* Start the Loop */
			while ( have_posts() ) : the_post();

				/**
				 * Run the loop for the search to output the results.
				 * If you want to overload this in a child theme then include a file
				 * called content-search.php and that will be used instead.
				 */
				get_template_part( 'template-parts/content', 'search' );

			endwhile;

			echo '</div>';

			if (function_exists('novo_wp_corenavi')) {
				echo novo_wp_corenavi();
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
