<?php 

/**
 * Enqueue child scripts and styles.
 */
function novo_child_scripts() {
	wp_enqueue_script( 'novo-child-script', get_stylesheet_directory_uri() . '/script.js', array('jquery'), '', true );
}
add_action( 'wp_enqueue_scripts', 'novo_child_scripts', 202 );