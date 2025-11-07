<?php

/**
 * WooCommerce Loop Product Thumbs
 **/
if (!function_exists('novo_woocommerce_template_loop_product_thumbnail')) {
	function novo_woocommerce_template_loop_product_thumbnail() {
		echo novo_woocommerce_get_product_thumbnail();
	}
}

if (!function_exists('novo_woocommerce_get_product_thumbnail')) {

	function novo_woocommerce_get_product_thumbnail($size = 'shop_catalog', $placeholder_width = 0, $placeholder_height = 0) {
		global $post, $woocommerce, $product, $woocommerce_loop;
		if (!$placeholder_width) {
			$placeholder_width = wc_get_image_size('shop_catalog')['width'];
		}

		if (!$placeholder_height) {
			$placeholder_height = wc_get_image_size('shop_catalog')['height'];
		}

    $type = 'grid';
    $popup = 'on';
    $popup_array = [];
    $link_atts = '';
    $original_image_array = yprm_get_image($product->get_image_id());
    $index = 0;

    if(isset($woocommerce_loop['type']) && $woocommerce_loop['type']) {
      $type = $woocommerce_loop['type'];
    }
    if(isset($woocommerce_loop['popup']) && $woocommerce_loop['popup']) {
      $popup = $woocommerce_loop['popup'];
    }
    if(isset($woocommerce_loop['index']) && $woocommerce_loop['index']) {
      $index = $woocommerce_loop['index'];
    }
    if(is_array( $original_image_array)){
    if($popup == 'on') {
        $popup_array['image'] = [
        'url' => $original_image_array[0],
        'w' => $original_image_array[1],
        'h' => $original_image_array[2]
      ];
	}
      $popup_array['title'] = $product->get_name();
      if(function_exists('mb_strimwidth')) {
        $popup_array['desc'] = mb_strimwidth($product->get_short_description(), 0, yprm_get_theme_setting('popup_desc_size'), '...');
      }
      $popup_array['post_id'] = $product->get_id();
      //$popup_array['likes'] = $likes;
      $popup_array['projectLink'] = $product->get_permalink();

      $link_atts = 'data-popup-json="'.esc_attr(json_encode($popup_array)).'" data-id="'.$index.'"';
    }

		$class = implode(' ', array_filter(array(
			'add_to_cart_button',
			'product_type_' . $product->get_type(),
			$product->supports('ajax_add_to_cart') && $product->is_in_stock() ? 'ajax_add_to_cart' : '',
			!$product->is_in_stock() ? 'out_of_stock' : '',
		)));

		$label = esc_html__('Add to cart', 'novo');

		if ($product->get_type() != 'simple' || !$product->is_in_stock()) {
			$label = yprm_get_theme_setting('tr_view');
		}

		$button_html = apply_filters('woocommerce_loop_add_to_cart_link',
			sprintf('<a rel="nofollow" href="%s" data-quantity="1" data-product_id="%s" data-product_sku="%s" class="%s" data-magic-cursor="link"><i class="base-icon-minicart"></i><span>%s</span></a>',
				esc_url($product->add_to_cart_url()),
				esc_attr($product->get_id()),
				esc_attr($product->get_sku()),
				esc_attr($class),
				esc_html($label)
			),
			$product);

		$output = '';
		$output = '<div class="image'.($type == 'masonry' ? ' masonry' : '').'">';
		if ($product->is_on_sale()) {
			$output .= '<span class="onsale accent"><span>' . esc_html__('Sale', 'novo') . '</span></span>';
		}

		if(!$product->is_in_stock()) {
			$output .= '<span class="out-of-stock">'.esc_html__('Out of stock', 'novo').'</span>';
		}

		if (class_exists('YPRM_Novo_Addons') && $attachment_ids = $product->get_gallery_image_ids()) {
      

			if (is_array($attachment_ids)) {
				if ($thumb = $product->get_image_id()) {
					array_unshift($attachment_ids, $thumb);
				}

				$output .= '<div class="product-thumb-slider swiper">';
				
				$output .= '<div class="swiper-wrapper">';
				foreach ($attachment_ids as $img_item) {
					$output .= '<div class="swiper-slide"><a href="' . get_the_permalink() . '" class="img" '.$link_atts.' style="'.yprm_get_image($img_item, 'bg', 'large').'"></a></div>';
				}
				$output .= '</div>';
				
				$output .= '<div class="buttons">';
					$output .= $button_html;
					$output .= '<div class="nav-arrows"><div class="prev base-icon-prev-2" data-magic-cursor="link"></div><div class="next base-icon-next-2" data-magic-cursor="link"></div></div>';
				$output .= '</div>';

				$output .= '</div>';

				wp_enqueue_script('swiper11');
				wp_enqueue_style('swiper11');
			}
      
      if($type == 'masonry') {
        $output .= '<a href="' . get_the_permalink() . '" class="img" '.$link_atts.'>'.yprm_get_image($product->get_image_id(), 'img', 'large').'</a>';
      }
		} else {
      if($type == 'masonry') {
        $output .= '<a href="' . get_the_permalink() . '" class="img" '.$link_atts.'>'.yprm_get_image($product->get_image_id(), 'img', 'large').'</a>';
      } else {
        $output .= '<a href="' . get_the_permalink() . '" class="img" style="'.yprm_get_image($product->get_image_id(), 'bg', 'large').'" '.$link_atts.'></a>';
      }
				
			$output .= '<div class="buttons">';
				$output .= $button_html;
			$output .= '</div>';
		}
		$output .= '</div>';
		$output .= '<div class="bottom">';
		$output .= '<h6 class="h"><a href="' . get_the_permalink() . '">' . strip_tags($product->get_name()) . '</a></h6>';
		$output .= '<div class="categories">'.wc_get_product_category_list($post->ID, ', ').'</div>';
		if ($price_html = $product->get_price_html()) {
			$output .= '<div class="price ' . esc_attr($product->get_type()) . '">' . wp_kses($price_html, 'post') . '</div>';
		}
		$output .= '</div>';

		return $output;
	}
}

remove_action('woocommerce_before_shop_loop_item_title', 'woocommerce_show_product_loop_sale_flash', 10);
remove_action('woocommerce_before_shop_loop_item_title', 'woocommerce_template_loop_product_thumbnail', 10);
add_action('woocommerce_before_shop_loop_item_title', 'novo_woocommerce_template_loop_product_thumbnail', 10);

/**
 * AJAX MiniCart
 */

function woocommerce_header_add_to_cart_fragment($fragments) {
	ob_start();
	echo yprm_wc_minicart();
	$fragments['.header-minicart-novo'] = ob_get_clean();
	return $fragments;
}
add_filter('woocommerce_add_to_cart_fragments', 'woocommerce_header_add_to_cart_fragment');

/**
 * Related Product Counts
 */

add_filter('woocommerce_output_related_products_args', 'novo_single_products_args', 20);
add_filter('woocommerce_upsell_display_args', 'novo_single_products_args', 20);
function novo_single_products_args($args) {
	$args['posts_per_page'] = 4;
	$args['columns'] = 4;
	return $args;
}

/**
 * Cross Sells Columns
 */

add_filter('woocommerce_cross_sells_columns', 'novo_woocommerce_cross_sells_columns', 20);
function novo_woocommerce_cross_sells_columns() {
	return 1;
}

/**
 * Mini Cart Buttons
 */

add_action('woocommerce_widget_shopping_cart_buttons', function () {
	remove_action('woocommerce_widget_shopping_cart_buttons', 'woocommerce_widget_shopping_cart_button_view_cart', 10);
	remove_action('woocommerce_widget_shopping_cart_buttons', 'woocommerce_widget_shopping_cart_proceed_to_checkout', 20);

	add_action('woocommerce_widget_shopping_cart_buttons', 'yprm_button_view_cart', 10);
	add_action('woocommerce_widget_shopping_cart_buttons', 'yprm_proceed_to_checkout', 20);
}, 1);

function yprm_button_view_cart() {
	$link = wc_get_cart_url();
	echo '<a href="' . esc_url($link) . '" class="button-style1"><span>' . esc_html__('View cart', 'novo') . '</span></a>';
}

function yprm_proceed_to_checkout() {
	$link = wc_get_checkout_url();
	echo '<a href="' . esc_url($link) . '" class="button-style1 checkout"><span>' . esc_html__('Checkout', 'novo') . '</span></a>';
}

/**
 * Product Icon Box
 */

function yprm_product_icon_box() {
	$icon1_class = yprm_get_theme_setting('product_icon_box1_icon');
	$icon1_label = nl2br(yprm_get_theme_setting('product_icon_box1_label'));
	$icon2_class = yprm_get_theme_setting('product_icon_box2_icon');
	$icon2_label = nl2br(yprm_get_theme_setting('product_icon_box2_label'));
	$icon3_class = yprm_get_theme_setting('product_icon_box3_icon');
	$icon3_label = nl2br(yprm_get_theme_setting('product_icon_box3_label'));

	$html = '';

	if(!empty($icon1_class) && !empty($icon1_label)) {
		$html .= '<div class="product-icon-box col-12 col-sm-4">
			<div class="icon '.esc_attr($icon1_class).'"></div>
			<div class="label">'.wp_kses($icon1_label, 'post').'</div>
		</div>';
	}

	if(!empty($icon2_class) && !empty($icon2_label)) {
		$html .= '<div class="product-icon-box col-12 col-sm-4">
			<div class="icon '.esc_attr($icon2_class).'"></div>
			<div class="label">'.wp_kses($icon2_label, 'post').'</div>
		</div>';
	}

	if(!empty($icon3_class) && !empty($icon3_label)) {
		$html .= '<div class="product-icon-box col-12 col-sm-4">
			<div class="icon '.esc_attr($icon3_class).'"></div>
			<div class="label">'.wp_kses($icon3_label, 'post').'</div>
		</div>';
	}

	if(!empty($html)) {
		echo '<div class="product-icon-box-row row">'.$html.'</div>';
	}
}
add_action('woocommerce_single_product_summary', 'yprm_product_icon_box', 25);

/**
 * Edit Actions
 */

remove_action('woocommerce_before_main_content', 'woocommerce_breadcrumb', 20);
remove_action('woocommerce_before_single_product_summary', 'woocommerce_show_product_sale_flash', 10);
remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_meta', 40);
remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30);
remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_sharing', 50);

add_action('woocommerce_single_product_summary', 'woocommerce_template_single_meta', 10);
add_action('woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 50);