<?php
/**
 * Template part for displaying page content in page.php.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package novo
 */

?>
<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

	<div class="site-content">
		<?php the_title( '<div class="heading-decor"><h1 class="h2">', '</h1></div>' ); ?>
		<?php the_content(); ?>
	</div><!-- .entry-content -->
</article><!-- #post-## -->
