<?php
/**
 * The template for displaying all single posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package Novo
 */

if (yprm_get_theme_setting('project_style') != 'horizontal') {
  $container = 'container';
} else {
  $container = 'project-horizontal';
}

if (yprm_get_theme_setting('project_image') == 'adaptive') {
  $container .= ' adaptive-img';
}

get_header(); ?>

<main class="main-row">
  <div class="<?php echo esc_attr($container) ?>">
    <?php while (have_posts()): the_post(); ?>
	    <div id="post-<?php the_ID(); ?>" <?php post_class() ?>>
	      <?php
  $id = get_the_ID();

  $item = get_post($id);

  $thumb = get_post_meta($id, '_thumbnail_id', true);

  $category = "";
  $category_name = "";
  $category_links_html = "";
  if (is_array(get_the_category($id)) && count(get_the_category($id)) > 0 && get_the_category($id)) {
    foreach (get_the_category($id) as $item) {
      $category .= $item->slug . ' ';
      $category_name .= $item->name . ' / ';
      $category_links_html .= '<a href="' . esc_url(get_category_link($item->cat_ID)) . '">' . esc_html($item->name) . '</a>, ';
    }
    $category_links_html = trim($category_links_html, ', ');
  }

  $tags_html = "";
  if (is_array(get_the_tags($id)) && count(get_the_tags($id)) > 0 && get_the_tags($id)) {
    foreach (get_the_tags($id) as $tag) {
      $tag_link = get_tag_link($tag->term_id);

      $tags_html .= '<a href="' . $tag_link . '">' . $tag->name . '</a>, ';
    }
    $tags_html = trim($tags_html, ', ');
  }

  $desc = strip_tags(strip_shortcodes($item->post_content));
  if (iconv_strlen($desc, 'UTF-8') > 200) {
    $desc = substr($desc, 0, 200);
  }

  $prev = get_permalink(get_adjacent_post(false, '', false));
  $next = get_permalink(get_adjacent_post(false, '', true));

  $thumbnails = get_post_meta($id, 'pt_gallery', true);

  $cols_css = '';

  switch (yprm_get_theme_setting('project_count_cols')) {
  case 'col2':
    $cols_css = 'col-12 col-sm-6';
    break;
  case 'col3':
    $cols_css = 'col-12 col-sm-6 col-md-4';
    break;
  case 'col4':
    $cols_css = 'col-12 col-sm-6 col-md-4 col-lg-3';
    break;
  default:
    $cols_css = 'col-12';
    break;
  }

  if (post_password_required($id)) {
    echo get_the_password_form();
  } else {

    if (yprm_get_theme_setting('project_style') != 'horizontal' && (yprm_get_theme_setting('project_style') != 'horizontal-type2' || !(is_array($thumbnails) && !empty($thumbnails) && count($thumbnails) > 0))) { ?>
	      <div class="site-content">
	        <div class="heading-decor">
	          <h1 class="h2"><?php echo esc_html(single_post_title()); ?></h1>
	        </div>
	        <?php if (yprm_get_theme_setting('project_date') == 'show') { ?>
	        <div class="date"><?php the_date() ?></div>
	        <?php }if (!empty($thumb) && empty($thumbnails) && yprm_get_theme_setting('project_image') != 'hide') { ?>
	        <div class="post-img"><?php echo wp_get_attachment_image($thumb, 'full'); ?></div>
	        <?php } ?>
	        <?php if (is_array($thumbnails) && !empty($thumbnails) && count($thumbnails) > 0) { ?>
	        <?php if (yprm_get_theme_setting('project_style') == 'masonry') { ?>
	        <div class="post-gallery-masonry row popup-gallery">
	          <?php foreach ($thumbnails as $index => $thumb) { ?>
	          <div class="<?php echo esc_attr($cols_css) ?> popup-item"><a
	              href="<?php echo esc_url(wp_get_attachment_image_src($thumb, 'full')[0]); ?>"
	              <?php echo yprm_get_image_popup_atts($thumb, $index) ?>><?php echo wp_get_attachment_image($thumb, 'large'); ?></a>
	          </div>
	          <?php } ?>
	        </div>
	        <?php } elseif (yprm_get_theme_setting('project_style') == 'grid') { ?>
        <div class="post-gallery-grid row popup-gallery">
          <?php foreach ($thumbnails as $index => $thumb) { ?>
          <div class="<?php echo esc_attr($cols_css) ?> popup-item"><a
              href="<?php echo esc_url(wp_get_attachment_image_src($thumb, 'full')[0]); ?>"
              <?php echo yprm_get_image_popup_atts($thumb, $index) ?>
              style="background-image: url(<?php echo esc_url(wp_get_attachment_image_src($thumb, 'large')[0]); ?>)"></a>
          </div>
          <?php } ?>
        </div>
        <?php } elseif (yprm_get_theme_setting('project_style') == 'slider') {
          wp_enqueue_style('owl-carousel');
          wp_enqueue_script('owl-carousel');
        ?>
        <div class="project-slider">
          <?php foreach ($thumbnails as $thumb) { ?>
          <div class="item">
            <div class="cell"><?php echo wp_get_attachment_image($thumb, 'large'); ?></div>
          </div>
          <?php } ?>
        </div>
        <div class="project-slider-carousel">
          <?php foreach ($thumbnails as $thumb) { ?>
          <div class="item"
            style="background-image: url(<?php echo wp_get_attachment_image_src($thumb, 'large')[0]; ?>);"></div>
          <?php } ?>
        </div>
        <?php } ?>
        <?php } ?>
        <div class="post-content">
          <?php the_content(''); ?>
          <?php if (function_exists('wp_link_pages')) { ?>
          <?php wp_link_pages(array('before' => '<div class="pagination">', 'after' => '</div>', 'link_before' => '<span>', 'link_after' => '</span>')); ?>
          <?php } if(class_exists('VideoUrlParser') && function_exists('get_field') && $video_url = get_field('video_url', $id)) { ?>
            <div class="project-video-block"><?php echo VideoUrlParser::get_player($video_url) ?></div>
          <?php } ?>
        </div>
      </div>
      <?php if (
        (function_exists('zilla_likes') && yprm_get_theme_setting('project_like') == 'show') ||
        (class_exists('YPRM_Popup') && yprm_get_theme_setting('project_share') == 'show') ||
        ($link = yprm_get_theme_setting('project_gallery_link')) ||
        yprm_get_theme_setting('project_navigation') == 'show'
      ) { ?>
        <div class="post-bottom">
          <?php if (function_exists('zilla_likes') && yprm_get_theme_setting('project_like') == 'show') {
            echo zilla_likes($id);
          } if(class_exists('YPRM_Popup') && yprm_get_theme_setting('project_share') == 'show') {
            $popup_block = new YPRM_Popup();
            $popup_block->share_button();
          } if ($link = yprm_get_theme_setting('project_gallery_link')) { $link_translated = __($link, 'novo'); ?>
          <a href="<?php echo esc_url($link_translated) ?>" class="back-to-main"><i class="fas fa-th"></i></a>
          <?php } if(yprm_get_theme_setting('project_navigation') == 'show') { ?>
            <div class="post-nav">
              <?php if (get_permalink() != $prev) { ?>
              <a href="<?php echo esc_url($prev); ?>"><i class="basic-ui-icon-left-arrow"></i> <span><?php echo esc_html__('previous post', 'novo') ?></span></a>
              <?php } ?>
              <?php if (get_permalink() != $next) { ?>
                <a href="<?php echo esc_url($next); ?>"><span><?php echo esc_html__('next post', 'novo') ?></span> <i class="basic-ui-icon-right-arrow"></i></a>
              <?php } ?>
            </div>
          <?php } ?>
        </div>
      <?php } ?>
      <?php } elseif (yprm_get_theme_setting('project_style') == 'horizontal') { ?>
      <div class="content">
        <?php if(function_exists('yprm_share_buttons') && yprm_get_theme_setting('project_share') == 'show') { ?>
          <div class="share-stick-block">
            <div class="label"><?php echo yprm_get_theme_setting('tr_share') ?></div>
            <?php echo yprm_share_buttons($id); ?>
          </div>
        <?php } ?>
        <h1 class="h3"><?php echo esc_html(single_post_title()); ?></h1>
        <?php if (yprm_get_theme_setting('project_date') == 'show') { ?>
        <div class="date"><?php the_date() ?></div>
        <?php }if ($desc) { ?>
        <div class="text"><?php echo esc_html($desc) ?></div>
        <?php } ?>
      </div>
      <?php if (is_array($thumbnails) && !empty($thumb) && empty($thumbnails) && count($thumbnails) > 0) { ?>
      <div class="project-horizontal-img"
        style="background-image: url(<?php echo wp_get_attachment_image_src($thumb, 'large')[0]; ?>)"></div>
      <?php } ?>
      <?php if (is_array($thumbnails) && !empty($thumbnails) && count($thumbnails) > 0) {
        wp_enqueue_style('owl-carousel');
        wp_enqueue_script('owl-carousel');
      ?>
      <div class="project-horizontal-slider">
        <?php foreach ($thumbnails as $thumb) { ?>
        <div class="item"><?php echo wp_get_attachment_image($thumb, 'large'); ?></div>
        <?php } ?>
        <?php if (get_permalink() != $next) { ?>
        <div class="item">
          <div class="cell">
            <a href="<?php echo esc_url($next); ?>"><span><?php echo esc_html__('next post', 'novo') ?></span> <i class="basic-ui-icon-right-arrow"></i></a>
          </div>
        </div>
        <?php } ?>
      </div>
      <?php } ?>
      <?php } elseif (yprm_get_theme_setting('project_style') == 'horizontal-type2') { ?>
        <?php if (is_array($thumbnails) && !empty($thumbnails) && count($thumbnails) > 0) { ?>
          <?php 
            wp_enqueue_script('swiper11');
            wp_enqueue_style('swiper11');
          ?>
          <div data-vc-full-width="true" data-vc-full-width-init="true" data-vc-stretch-content="true" class="vc_row wpb_row vc_row-fluid">
            <div class="portfolio-block portfolio-type-carousel2 project-single-carousel popup-gallery">
              <div class="prev basic-ui-icon-left-arrow"></div>
              <div class="next basic-ui-icon-right-arrow"></div>
              <div class="swiper">
                <div class="swiper-wrapper">
                  <?php foreach ($thumbnails as $index => $thumb) { 
                    $img_array = wp_get_attachment_image_src($thumb, 'full');
                  ?>
                    <div class="swiper-slide popup-item">
                      <div class="wrap">
                        <?php echo wp_get_attachment_image($thumb, 'large'); ?>
                        <a href="<?php echo esc_url($img_array[0]) ?>" <?php echo yprm_get_image_popup_atts($thumb, $index) ?>></a>
                      </div>
                    </div>
                  <?php } ?>
                </div>
              </div>
            </div>
          </div>
          <div class="vc_row-full-width vc_clearfix"></div>
        <?php } ?>
        <div class="site-content">
	        <div class="heading-decor">
	          <h1 class="h2"><?php echo esc_html(single_post_title()); ?></h1>
	        </div>
	        <?php if (yprm_get_theme_setting('project_date') == 'show') { ?>
	        <div class="date"><?php the_date() ?></div>
	        <?php }if (!empty($thumb) && empty($thumbnails) && yprm_get_theme_setting('project_image') != 'hide') { ?>
	        <div class="post-img"><?php echo wp_get_attachment_image($thumb, 'full'); ?></div>
	        <?php } ?>
          <div class="post-content">
            <?php the_content(''); ?>
            <?php if (function_exists('wp_link_pages')) { ?>
            <?php wp_link_pages(array('before' => '<div class="pagination">', 'after' => '</div>', 'link_before' => '<span>', 'link_after' => '</span>')); ?>
            <?php } ?>
          </div>
        </div>
        <?php if (
          (function_exists('zilla_likes') && yprm_get_theme_setting('project_like') == 'show') ||
          (class_exists('YPRM_Popup') && yprm_get_theme_setting('project_share') == 'show') ||
          ($link = yprm_get_theme_setting('project_gallery_link')) ||
          yprm_get_theme_setting('project_navigation') == 'show'
        ) { ?>
          <div class="post-bottom">
            <?php if (function_exists('zilla_likes') && yprm_get_theme_setting('project_like') == 'show') {
              echo zilla_likes($id);
            } if(class_exists('YPRM_Popup') && yprm_get_theme_setting('project_share') == 'show') {
              $popup_block = new YPRM_Popup();
              $popup_block->share_button();
            } if ($link = yprm_get_theme_setting('project_gallery_link')) { $link_translated = __($link, 'novo'); ?>
            <a href="<?php echo esc_url($link_translated) ?>" class="back-to-main"><i class="fas fa-th"></i></a>
            <?php } if(yprm_get_theme_setting('project_navigation') == 'show') { ?>
              <div class="post-nav">
                <?php if (get_permalink() != $prev) { ?>
                <a href="<?php echo esc_url($prev); ?>"><i class="basic-ui-icon-left-arrow"></i> <span><?php echo esc_html__('previous post', 'novo') ?></span></a>
                <?php } ?>
                <?php if (get_permalink() != $next) { ?>
                  <a href="<?php echo esc_url($next); ?>"><span><?php echo esc_html__('next post', 'novo') ?></span> <i class="basic-ui-icon-right-arrow"></i></a>
                <?php } ?>
              </div>
            <?php } ?>
          </div>
        <?php } ?>
        <?php } ?>
      <?php } ?>
    </div>
    <?php endwhile; ?>

  </div>
</main>

<?php
if(yprm_get_theme_setting('project_footer') == 'minified') {
  get_footer('simple');
} else {
  get_footer();
}
