<?php
/**
 * Template part for displaying posts.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package novo
 */

global $loop_index;

$class = "";

if(!class_exists('YPRM_Get_Project')) return false;

$id = get_the_ID(); 

$project_object = new YPRM_Get_Project([
  'id' => $id,
  'popup_mode' => yprm_get_theme_setting('project_in_popup'),
  'index' => $loop_index++
]);

$cols_css = '';

switch (yprm_get_theme_setting('portfolio_cols')) {
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

if(yprm_get_theme_setting('project_in_popup') != 'no') {
  $cols_css .= ' popup-item';
}

?>
<article id="post-<?php echo $id; ?>" <?php post_class('portfolio-item '.$cols_css) ?>>
  <?php if (yprm_get_theme_setting('portfolio_style') == 'masonry') {?>
    <div class="a-img">
      <?php echo $project_object->get_image_html() ?>
    </div>
  <?php } else { ?>
    <div class="a-img" data-original="<?php echo esc_url($project_object->get_image_original()[0]); ?>">
      <div style="<?php echo $project_object->get_image_bg() ?>"></div>
    </div>
  <?php } ?>
  <div class="content">
    <h5><?php echo esc_html($project_object->get_title()); ?></h5>
    <p><?php echo wpautop($project_object->get_short_description()); ?></p>
  </div>
  <?php $project_object->get_link_html()?>
</article>