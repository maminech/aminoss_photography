<?php
/**
 * The template for displaying product content in the single-product.php template
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/content-single-product.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://docs.woocommerce.com/document/template-structure/
 * @package WooCommerce/Templates
 * @version 4.4.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

/**
 * Hook: woocommerce_before_single_product.
 *
 * @hooked wc_print_notices - 10
 */
do_action( 'woocommerce_before_single_product' );

if ( post_password_required() ) {
	echo get_the_password_form(); // WPCS: XSS ok.
	return;
}

$product_additional_class = '';

$attachment_ids = $product->get_gallery_image_ids();

if(is_array($attachment_ids) && count($attachment_ids) > 0) {
  $product_additional_class .= ' with-thumbs';
}

?>
<div id="product-<?php the_ID(); ?>" <?php wc_product_class($product_additional_class, $product); ?>>

  <?php if(function_exists('yprm_share_buttons') && yprm_get_theme_setting('product_share_links') == 'true') { ?>
    <div class="share-stick-block">
      <div class="label"><?php echo esc_html__('Share:', 'novo') ?></div>
      <?php echo yprm_share_buttons(get_the_ID()) ?>
    </div>
  <?php } ?>

  <?php if(yprm_get_theme_setting('product_breadcrumbs') == 'true' && yprm_get_theme_setting('product_back_button') == 'true') { ?>
    <div class="product-top">
      <?php if(yprm_get_theme_setting('product_breadcrumbs') == 'true') {
        woocommerce_breadcrumb(array(
          'delimiter' => '<i class="basic-ui-icon-right-arrow"></i>',
          'wrap_before' => '<div class="breadcrumbs">',
          'wrap_after'  => '</div>',
        ));
      } if(yprm_get_theme_setting('product_back_button') == 'true') { ?>
        <div class="back-h-button" onclick="history.back();">
          <i class="basic-ui-icon-left-arrow"></i>
          <span><?php echo yprm_get_theme_setting('tr_back') ?></span>
        </div>
      <?php } ?>
    </div>
  <?php } ?>

  <div class="poduct-content-row row">
    <?php
      /**
       * Hook: woocommerce_before_single_product_summary.
       *
       * @hooked woocommerce_show_product_sale_flash - 10
       * @hooked woocommerce_show_product_images - 20
       */
      do_action( 'woocommerce_before_single_product_summary' );
    ?>

    <div class="summary entry-summary col">
      <?php

        /**
         * Hook: woocommerce_single_product_summary.
         *
         * @hooked woocommerce_template_single_title - 5
         * @hooked woocommerce_template_single_rating - 10
         * @hooked woocommerce_template_single_price - 10
         * @hooked woocommerce_template_single_excerpt - 20
         * @hooked woocommerce_template_single_add_to_cart - 30
         * @hooked woocommerce_template_single_meta - 40
         * @hooked woocommerce_template_single_sharing - 50
         * @hooked WC_Structured_Data::generate_product_data() - 60
         */
        do_action( 'woocommerce_single_product_summary' );
      ?>
    </div>
  </div>

	<?php
		/**
		 * Hook: woocommerce_after_single_product_summary.
		 *
		 * @hooked woocommerce_output_product_data_tabs - 10
		 * @hooked woocommerce_upsell_display - 15
		 * @hooked woocommerce_output_related_products - 20
		 */
		do_action( 'woocommerce_after_single_product_summary' );
	?>
</div>

<?php do_action( 'woocommerce_after_single_product' ); ?>
