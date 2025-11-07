<?php
/**
 * The template for displaying product content within loops
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/content-product.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://docs.woocommerce.com/document/template-structure/
 * @package WooCommerce/Templates
 * @version 9.9.0
 */

defined( 'ABSPATH' ) || exit;

global $product, $woocommerce_loop;

// Ensure visibility.
if ( empty( $product ) || ! $product->is_visible() ) {
	return;
}

switch (wc_get_loop_prop( 'columns' )) {
  case '1':
    $item_col = "col-12";
    break;
  case '2':
    $item_col = "col-12 col-sm-6";
    break;
  case '3':
    $item_col = "col-12 col-sm-6 col-md-4";
    break;
  case '4':
    $item_col = "col-12 col-sm-4 col-md-4 col-lg-3";
    break;

  default:
    $item_col = "";
    break;
}

if(wc_get_loop_prop('type') == 'grid') {
  $item_col .= ' '.wc_get_loop_prop('photo_orientation');
}

$class = implode(' ', array_filter(array(
  'add_to_cart_button',
  'product_type_' . $product->get_type(),
  $product->supports('ajax_add_to_cart') ? 'ajax_add_to_cart' : '',
)));

$label = esc_html__('Add to cart', 'novo');

if ($product->get_type() != 'simple') {
  $label = yprm_get_theme_setting('tr_view');
}

$button_html = apply_filters('woocommerce_loop_add_to_cart_link',
  sprintf('<a rel="nofollow" href="%s" data-quantity="1" data-product_id="%s" data-product_sku="%s" class="%s" data-magic-cursor="link"><span>%s</span></a>',
    esc_url($product->add_to_cart_url()),
    esc_attr($product->get_id()),
    esc_attr($product->get_sku()),
    esc_attr($class),
    esc_html($label)
  ),
$product);

?>
<li <?php wc_product_class($item_col, $product); ?>>
  <div class="product-wrap">
    <?php
    /**
     * Hook: woocommerce_before_shop_loop_item_title.
     *
     * @hooked woocommerce_show_product_loop_sale_flash - 10
     * @hooked woocommerce_template_loop_product_thumbnail - 10
     */
    do_action( 'woocommerce_before_shop_loop_item_title' );
    ?>
  </div>
</li>