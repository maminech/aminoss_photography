<?php

if(function_exists("register_field_group"))
{
  $header_field = array();
	$footer_field = array();

	if(function_exists('yprm_get_headers')) {
		$header_field = array(
			'key' => 'field_28f308230eb6',
			'label' => esc_html__('Header Type', 'novo'),
			'name' => 'header_style',
			'type' => 'select',
			'choices' => yprm_get_headers(array(
				'default' => esc_html__('Default', 'novo')
			)),
			'default_value' => 'default',
			'allow_null' => 0,
			'multiple' => 0,
		);
	}

	if(function_exists('yprm_get_footers')) {
		$footer_field = array(
			'key' => 'field_5a78d67f7679',
			'label' => esc_html__('Footer Type', 'novo'),
			'name' => 'footer',
			'type' => 'select',
			'choices' => yprm_get_footers(array(
				'default' => esc_html__('Default', 'novo')
			)),
			'default_value' => 'default',
			'allow_null' => 0,
			'multiple' => 0,
		);
	}

	register_field_group(array (
		'id' => 'acf_page-settings',
		'title' => 'Page settings',
		'fields' => array (
			array (
				'key' => 'field_58afe3b800d91',
				'label' => 'Site color mode',
				'name' => 'site_color_mode',
				'type' => 'select',
				'choices' => array (
					'default' => 'Default',
					'light' => 'Light',
					'dark' => 'Dark',
				),
				'default_value' => '',
				'allow_null' => 0,
				'multiple' => 0,
				'instructions' => wp_kses(__('<b>Dark</b> - White text color & Dark background color<br><b>Light</b> - Black text color & Light background color', 'morave'), 'post'),
			),
			array (
				'key' => 'field_58a43bba66153',
				'label' => 'Header color mode',
				'name' => 'header_color_mode',
				'type' => 'select',
				'choices' => array (
					'default' => 'Default',
					'light' => 'Light',
					'dark' => 'Dark',
				),
				'default_value' => '',
				'allow_null' => 0,
				'multiple' => 0,
				'instructions' => wp_kses(__('<b>Light</b> - White text color & Dark background color<br><b>Dark</b> - Black text color & Light background color', 'morave'), 'post'),
			),
			$header_field,
			array (
				'key' => 'field_58a58ef19684e',
				'label' => 'Header container',
				'name' => 'header_container',
				'type' => 'select',
				'choices' => array (
					'default' => 'Default',
					'container' => 'Center container',
					'container-fluid' => 'Full witdh',
				),
				'default_value' => 'default',
				'allow_null' => 0,
				'multiple' => 0,
			),
			array (
				'key' => 'field_58a43c2266154',
				'label' => 'Header space',
				'name' => 'header_space',
				'type' => 'radio',
				'choices' => array (
					'yes' => 'Yes',
					'no' => 'No',
				),
				'other_choice' => 0,
				'save_other_choice' => 0,
				'default_value' => 'yes',
				'layout' => 'horizontal',
			),
			$footer_field,
			array (
				'key' => 'field_59b7de64cddee',
				'label' => 'Social buttons in footer',
				'name' => 'footer_social_buttons',
				'type' => 'select',
				'choices' => array (
					'default' => 'Default',
					'show' => 'Show',
					'hide' => 'Hide',
				),
				'default_value' => '',
				'allow_null' => 0,
				'multiple' => 0,
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'page_template',
					'operator' => '==',
					'value' => 'template-landing.php',
					'order_no' => 0,
					'group_no' => 0,
				),
			),
		),
		'options' => array (
			'position' => 'side',
			'layout' => 'default',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
	register_field_group(array (
		'id' => 'acf_post-settings',
		'title' => 'Post settings',
		'fields' => array (
			array (
				'key' => 'field_5a267b95916ab',
				'label' => 'Video url',
				'name' => 'video_url',
				'type' => 'text',
				'default_value' => '',
				'placeholder' => '',
				'prepend' => '',
				'append' => '',
				'formatting' => 'html',
				'maxlength' => '',
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'post',
					'order_no' => 0,
					'group_no' => 0,
				),
			),
		),
		'options' => array (
			'position' => 'side',
			'layout' => 'default',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
	register_field_group(array (
		'id' => 'acf_project-settings',
		'title' => 'Project settings',
		'fields' => array (
			array (
				'key' => 'field_59c0c8123r',
				'label' => esc_html__('Image position', 'novo'),
				'name' => 'project_image_position',
				'type' => 'select',
				'choices' => array (
					'top' => esc_html__('Top', 'novo'),
					'left' => esc_html__('Left', 'novo'),
					'right' => esc_html__('Right', 'novo'),
					'center' => esc_html__('Center', 'novo'),
					'bottom' => esc_html__('Bottom', 'novo'),
				),
				'default_value' => 'center',
				'allow_null' => 0,
				'multiple' => 0,
			),
			array (
				'key' => 'field_59c0c83cdb361',
				'label' => 'Style',
				'name' => 'project_style',
				'type' => 'select',
				'choices' => array (
					'default' => 'Default',
					'grid' => 'Grid',
					'slider' => 'Slider',
					'masonry' => 'Masonry',
					'horizontal' => 'Horizontal',
					'horizontal-type2' => 'Horizontal Type 2',
				),
				'default_value' => 'default',
				'allow_null' => 0,
				'multiple' => 0,
			),
			array (
				'key' => 'field_59c0c83nlg94',
				'label' => 'Cols count',
				'name' => 'project_count_cols',
				'type' => 'select',
				'choices' => array (
					'default' => 'Default',
					'col2' => 'Col 2',
					'col3' => 'Col 3',
					'col4' => 'Col 4',
				),
				'default_value' => 'default',
				'conditional_logic' => array (
					'status' => 1,
					'rules' => array (
						array (
							'field' => 'field_59c0c83cdb361',
							'operator' => '!=',
							'value' => 'default',
						),
						array (
							'field' => 'field_59c0c83cdb361',
							'operator' => '!=',
							'value' => 'slider',
						),
						array (
							'field' => 'field_59c0c83cdb361',
							'operator' => '!=',
							'value' => 'horizontal',
						),
						array (
							'field' => 'field_59c0c83cdb361',
							'operator' => '!=',
							'value' => 'horizontal-type2',
						),
					),
					'allorany' => 'all',
				),
				'allow_null' => 0,
				'multiple' => 0,
			),
			array (
				'key' => 'field_59c3a84023b44',
				'label' => 'Project image',
				'name' => 'project_image',
				'type' => 'select',
				'choices' => array (
					'default' => 'Default',
					'full' => 'Full',
					'adaptive' => 'Adaptive',
				),
				'default_value' => '',
				'allow_null' => 0,
				'multiple' => 0,
			),
			array (
				'key' => 'field_5a267b3b77f84',
				'label' => 'Video url',
				'name' => 'video_url',
				'type' => 'text',
				'default_value' => '',
				'placeholder' => '',
				'prepend' => '',
				'append' => '',
				'formatting' => 'html',
				'maxlength' => '',
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'pt-portfolio',
					'order_no' => 0,
					'group_no' => 0,
				),
			),
		),
		'options' => array (
			'position' => 'side',
			'layout' => 'default',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
	register_field_group(array (
		'id' => 'acf_post-settings-2',
		'title' => 'Short description',
		'fields' => array (
			array (
				'key' => 'field_5a267b326916ab',
				'label' => false,
				'name' => 'short_desc',
				'type' => 'textarea',
				'default_value' => '',
				'placeholder' => '',
				'prepend' => '',
				'append' => '',
				'formatting' => 'html',
				'maxlength' => '',
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'post',
					'order_no' => 0,
					'group_no' => 0,
				),
			),
      array(
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'pt-portfolio',
					'order_no' => 0,
					'group_no' => 0,
				),
      )
		),
		'options' => array (
			'position' => 'normal',
			'layout' => 'default',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
	register_field_group(array (
		'id' => 'acf_product-settings',
		'title' => esc_html__('Product settings', 'sansara'),
		'fields' => array (
			array (
				'key' => 'field_175353125234',
				'label' => esc_html__('Video url', 'sansara'),
				'name' => 'product_video_url',
				'type' => 'text',
				'instructions' => esc_html__('Supported YouTube or Vimeo link', 'sansara'),
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'product',
					'order_no' => 0,
					'group_no' => 0,
				),
			),
		),
		'options' => array (
			'position' => 'side',
			'layout' => 'default',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
}

if(function_exists('acf_add_local_field_group')) {
	acf_add_local_field_group(array (
		'key' => 'acf_cat-settings',
		'title' => esc_html__('Cat settings', 'sansara'),
		'fields' => array (
			array (
				'key' => 'field_vj3s94xz834',
				'label' => esc_html__('Image', 'sansara'),
				'name' => 'category_image',
				'type' => 'image',
			),
		),
		'location' => array(
      array(
        array(
          'param' => 'taxonomy',
          'operator' => '==',
          'value' => 'all',
        ),
      ),
    ),
    'menu_order' => 0,
    'position' => 'normal',
    'style' => 'seamless',
    'label_placement' => 'top',
    'instruction_placement' => 'label',
    'hide_on_screen' => '',
    'active' => true,
    'description' => '',
	));
}
