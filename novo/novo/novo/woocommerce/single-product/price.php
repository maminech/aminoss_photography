<?php
/**
 * Single Product Price
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/price.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://docs.woocommerce.com/document/template-structure/
 * @author  WooThemes
 * @package WooCommerce/Templates
 * @version 3.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

global $post, $product;

$stock_class = '';
if(!$product->is_in_stock()) {
  $stock_class = ' out-stock';
  $stock_label = esc_html__('Out of stock', 'novo');
} else {
  $stock_label = esc_html__('In stock', 'novo');
}

?>
<div class="price-block">
  <div class="price"><?php echo wp_kses($product->get_price_html(), 'post'); ?></div>
  <div class="stock-status<?php echo esc_attr($stock_class) ?>"><?php echo esc_html($stock_label) ?></div>
</div>
