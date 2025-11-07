<?php
/**
 * Template part for displaying posts.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package novo
 */


$class = "";

$type = yprm_get_theme_setting('blog_type');
$cols = yprm_get_theme_setting('blog_cols');
$blog_author = yprm_get_theme_setting('blog_post_author');
$blog_image = yprm_get_theme_setting('blog_post_image');
$blog_date = yprm_get_theme_setting('blog_post_date');
$blog_short_desc = yprm_get_theme_setting('blog_post_short_desc');
$blog_read_more = yprm_get_theme_setting('blog_post_read_more');
$blog_comments = yprm_get_theme_setting('blog_post_comments');
$blog_likes = yprm_get_theme_setting('blog_post_likes');

$id = get_the_ID(); 
$item = get_post($id);
setup_postdata($item);
$name = $item->post_title;
$post_author = $item->post_author;
$thumb = get_post_meta( $id, '_thumbnail_id', true );
$link = get_permalink($id);

if($blog_image != 'show') {
	$thumb = '';
}

$desc_size = '195';

if(function_exists('get_field') && !empty(get_field('short_desc'))) {
	$desc = strip_tags(strip_shortcodes(get_field('short_desc')));
} else {
	$desc = strip_tags(strip_shortcodes($item->post_content));
}

$desc = substr($desc, 0, $desc_size);
$desc = rtrim($desc, "!,.-");
$desc = substr($desc, 0, strrpos($desc, ' '))."...";

$class = "";
if(!empty($thumb)) {
	$class = " with-image";
}

if(!class_exists('WPBakeryShortCode')) {
	$class .= " min";
}

if ($type == 'horizontal') {
	$cols = 'col1';
	$desc_size = '455';
}

$desc = mb_strimwidth($desc, 0, $desc_size, '...');

switch ($cols) {
case 'col1':
	$item_col = "col-12";
	break;
case 'col2':
	$item_col = "col-12 col-sm-6 col-md-6";
	break;
case 'col3':
	$item_col = "col-12 col-sm-4 col-md-4";
	break;
case 'col4':
	$item_col = "col-12 col-sm-4 col-md-3";
	break;

default:
	$item_col = "";
	break;
}

if($blog_author == 'show') {
	$author_block = '
	<div class="author-info-block">
		<div class="author-info-avatar" style="background-image: url('.get_avatar_url($post_author).')"></div>
		<div class="author-info-content">
			<div class="name">'.get_the_author_meta('display_name', $post_author).'</div>
			'.($blog_date == 'show' ? '<div class="date">'.get_the_date('', $id).'</div>' : '').'
		</div>
	</div>
	';
} else {
	$author_block = '';
}



?>
<article id="post-<?php the_ID(); ?>" <?php post_class('blog-item '.$item_col.' '.$class) ?>>
	<div class="wrap">
		<?php if(!empty($thumb)) { ?>
			<?php if($type == 'masonry') { ?>
				<div class="img">
					<a href="<?php echo esc_url($link); ?>"><img src="<?php echo wp_get_attachment_image_src($thumb, 'large')[0] ?>" alt="<?php echo esc_html($name); ?>"></a>
					<?php echo $author_block; ?>
				</div>
			<?php } else { ?>
				<div class="img">
					<a href="<?php echo esc_url($link); ?>" style="background-image: url(<?php echo wp_get_attachment_image_src($thumb, 'large')[0] ?>);"></a>
					<?php echo $author_block; ?>
				</div>
			<?php } ?>
		<?php } ?>
		<div class="content">
			<h5><a href="<?php echo esc_url($link); ?>"><?php echo esc_html($name); ?></a></h5>
			<?php if($blog_date == 'show' && !$author_block) { ?>
				<div class="date">
					<?php if(is_sticky()) { ?>
					<div class="sticky-a"><i class="basic-ui-icon-clip"></i> <span><?php echo esc_html__('Sticky ', 'novo') ?></span></div>
					<?php } ?>
					<?php echo get_the_date() ?>
				</div>
			<?php } if($blog_short_desc == 'show') {
			if(!class_exists('WPBakeryShortCode')) { ?>
				<div class="text"><?php the_content(); ?></div>
			<?php } else { ?>
				<p><?php echo esc_html($desc); ?></p>
			<?php } if(function_exists('wp_link_pages')) {
					wp_link_pages(array('before' => '<div class="pagination">', 'after' => '</div>'));
				}
			} if($blog_read_more == 'show') { ?>
				<a href="<?php echo esc_url(get_permalink($id)) ?>" class="button-style2"><?php echo yprm_get_theme_setting('tr_read_more') ?></a>
			<?php } ?>
		</div>
		<div class="clear"></div>
		<?php if($blog_likes == 'show' || $blog_comments == 'show') { ?>
			<div class="bottom like-on comment-on">
				<?php if(function_exists('zilla_likes') && $blog_likes == 'show'){ ?>
					<div class="col"><?php echo zilla_likes($id) ?></div>
				<?php } if($blog_comments == 'show') { ?>
					<div class="col"><i class="multimedia-icon-speech-bubble-1"></i> <a href="<?php echo esc_url($link); ?>#comments"><?php echo get_comments_number_text() ?></a></div>
				<?php } ?>
			</div>
		<?php } ?>
	</div>
</article>
<?php wp_reset_postdata(); ?> 