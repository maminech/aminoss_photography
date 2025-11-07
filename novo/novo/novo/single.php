<?php
/**
 * The template for displaying all single posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package Novo
 */

get_header(); ?>

	<main class="main-row">
		<div class="container">
      <div class="heading-decor">
				<h1 class="h2"><?php echo esc_html(single_post_title()); ?></h1>
				<?php if(function_exists('yprm_share_buttons') && yprm_get_theme_setting('blog_share') == 'show') { ?>
					<div class="share-stick-block">
						<div class="label"><?php echo yprm_get_theme_setting('tr_share') ?></div>
						<?php echo yprm_share_buttons(get_the_ID()); ?>
					</div>
				<?php } ?>
      </div>
      <?php
      if(is_active_sidebar('blog-sidebar') && yprm_get_theme_setting('blog_sidebar') == 'show') {
        echo '<div class="row">';
        echo '<div class="col-12 col-md-8">';
      }
      
      while ( have_posts() ) : the_post(); ?>
        <div id="post-<?php the_ID(); ?>" <?php post_class() ?>>
          <?php 
            $id = get_the_ID();

            $item = get_post($id);

            $thumb = get_post_meta( $id, '_thumbnail_id', true );

            $category = "";
            $category_name = "";
            $category_links_html = "";
            if(is_array(get_the_category($id)) && count(get_the_category($id)) > 0 && get_the_category($id)) {
              foreach (get_the_category($id) as $item) {
                $category .= $item->slug.' ';
                $category_name .= $item->name.' / ';
                $category_links_html .= '<a href="'.esc_url(get_category_link($item->cat_ID)).'">'.esc_html($item->name).'</a>, ';
              }
              $category_links_html = trim($category_links_html, ', ');
            }

            $tags_html = "";
            if(is_array(get_the_tags($id)) && count(get_the_tags($id)) > 0 && get_the_tags($id)) {
              foreach (get_the_tags($id) as $tag){
                $tag_link = get_tag_link($tag->term_id);

                $tags_html .= '<a href="'.$tag_link.'">'.$tag->name.'</a>, ';
              }
              $tags_html = trim($tags_html, ', ');
            }

            $prev = get_permalink(get_adjacent_post(false,'',false));
            $next = get_permalink(get_adjacent_post(false,'',true));

            if(post_password_required( $id )) {
              echo get_the_password_form();
            } else {
          ?>
            <div class="site-content">
							<?php if(yprm_get_theme_setting('blog_date') == 'show') { ?>
                <div class="date"><?php the_date() ?></div>
              <?php } if(class_exists('VideoUrlParser') && function_exists('get_field') && $video_url = get_field('video_url', $id)) { ?>
                <div class="project-video-block"><?php echo VideoUrlParser::get_player($video_url) ?></div>
              <?php } else if(yprm_get_theme_setting('blog_feature_image') == 'show' && !empty($thumb)) { ?>
                <div class="post-img"><?php echo wp_get_attachment_image($thumb, ''); ?></div>
              <?php } ?>
              <div class="post-content">
                <?php the_content(''); ?>
                <?php if(function_exists('wp_link_pages')) { ?>
                  <?php wp_link_pages(array('before' => '<div class="pagination">', 'after' => '</div>','link_before' => '<span>','link_after' => '</span>',)); ?>
                <?php } ?>
              </div>
            </div>
            <div class="post-bottom">
              <?php if( yprm_get_theme_setting('blog_like') == 'show' && function_exists('zilla_likes') ) echo zilla_likes($id) ?>
              <?php if(yprm_get_theme_setting('blog_navigation') == 'show') { ?>
                <div class="post-nav">
                  <?php if(get_permalink() != $prev ) { ?>
                  <a href="<?php echo esc_url($prev); ?>"><i class="basic-ui-icon-left-arrow"></i> <span><?php echo esc_html__('previous post', 'novo') ?></span></a>
                  <?php } ?>
                  <?php if(get_permalink() != $next ) { ?>
                  <a href="<?php echo esc_url($next); ?>"><span><?php echo esc_html__('next post', 'novo') ?></span> <i class="basic-ui-icon-right-arrow"></i></a>
                  <?php } ?>
                </div>
              <?php } ?>
            </div>
            <?php if ( yprm_get_theme_setting('blog_comments') == 'show' && (comments_open() || get_comments_number()) ) :
              comments_template();
            endif; ?>
        <?php } ?>
          </div>
      <?php endwhile; 
      
      if(is_active_sidebar('blog-sidebar') && yprm_get_theme_setting('blog_sidebar') == 'show') {
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

<?php
get_footer();
