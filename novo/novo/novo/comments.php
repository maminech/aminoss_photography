<?php
/**
 * The template for displaying comments.
 *
 * This is the template that displays the area of the page that contains both the current comments
 * and the comment form.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package novo
 */

/*
 * If the current post is protected by a password and
 * the visitor has not yet entered the password we will
 * return early without loading the comments.
 */
if ( post_password_required() ) {
	return;
}

function novo_comment($comment, $args, $depth) {
   $GLOBALS['comment'] = $comment; ?>
	<li class="comment-item clearfix" id="comment-<?php echo esc_attr($comment->comment_ID) ?>">
		<?php if(get_avatar_url($comment, 80 )) { ?>
		<div class="image" style="background-image: url(<?php echo esc_url(get_avatar_url($comment, 80 )); ?>);"></div>
		<?php } ?>
		<div class="text">
			<a href="#" class="button-style4 replytocom" data-id="<?php echo esc_html(get_comment_ID()) ?>"><span><?php echo esc_html_e( 'reply', 'novo' ); ?></span></a>
			<h6><?php echo esc_html($comment->comment_author); ?></h6>
			<div class="date"><?php echo mysql2date(get_option( 'date_format' ), $comment->comment_date); ?></div>
			<div class="content"><?php echo wp_kses($comment->comment_content, 'post') ?></div>
		</div>
	</li>
<?php
}
?>

<div id="comments" class="comments-area">

	<?php
	// You can start editing here -- including this comment!
	if ( have_comments() ) : ?>
		<div class="heading-decor">
			<h3><span><?php echo esc_html_e( 'Comments', 'novo' ); ?></span></h3>
		</div>
		<div class="comment-items-wrap">
			
			<ul class="comment-items">
				<?php wp_list_comments(array('callback' => 'novo_comment')); ?>
			</ul>
			<?php if(paginate_comments_links()) { ?>
			<div class="pagination">
				<?php echo paginate_comments_links(); ?>
			</div>
			<?php } ?>
		</div>
		<?php

	endif; // Check for have_comments().


	// If comments are closed and there are comments, let's leave a little note, shall we?
	if ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) : ?>

		<p class="no-comments"><?php echo esc_html_e( 'Comments are closed.', 'novo' ); ?></p>
	<?php
	endif;
	//we don't use this functions
	
	add_filter('comment_form_fields', 'novo_reorder_comment_fields' );
	function novo_reorder_comment_fields( $fields ){
		// die(print_r( $fields ));

		$new_fields = array(); 

		$myorder = array('author','email','url','comment');

		foreach( $myorder as $key ){
			$new_fields[ $key ] = $fields[ $key ];
			unset( $fields[ $key ] );
		}

		if( $fields )
			foreach( $fields as $key => $val )
				$new_fields[ $key ] = $val;

		return $new_fields;
	}

	$post_id = get_the_ID();
	?>

	<div id="commentform-area">
		<?php comment_form(array(
			'fields' => array(
				'author' => '<div class="col-12 col-sm-6">' . '<input id="author" class="style1" name="author" type="text" placeholder="'. esc_html__( 'Enter your Name...','novo' ) .'" value="' . esc_attr( $commenter['comment_author'] ) . '" size="30" /></div>',
				'email'  => '<div class="col-12 col-sm-6"><input id="email" class="style1" name="email" type="text" placeholder="'. esc_html__( ' Enter your e-mail...','novo' ) .'" value="' . esc_attr(  $commenter['comment_author_email'] ) . '" size="30" /></div>',
				'url'    => '',
			),
			'logged_in_as'         => '<div class="col-12"><p>' . sprintf( __( '<a href="%1$s" aria-label="Logged in as %2$s. Edit your profile.">Logged in as %2$s</a>. <a href="%3$s">Log out?</a>','novo' ), get_edit_user_link(), $user_identity, wp_logout_url( apply_filters( 'the_permalink', get_permalink( $post_id ) ) ) ) . '</p></div>',
			'class_form'           => 'comment-form row',
			'comment_field'        => '<div class="col-12"><textarea id="comment" class="style1" name="comment" placeholder="'. esc_html__( 'Enter your comment...','novo' ) .'" rows="5" maxlength="65525" required="required"></textarea></div>',
			'label_submit'         => esc_html__( 'Send' ,'novo'),
			'submit_button'        => '<input name="%1$s" type="submit" id="%2$s" class="button-style1" value="%4$s" />',
			'submit_field'         => '<div class="col-12">%1$s %2$s</div>',
			'comment_notes_before' => '',
			'title_reply_before'   => '<div class="heading-decor"><h3><span>',
			'title_reply_after'    => '</span></h3></div>',
			'title_reply'          => esc_html__( 'Leave a comment', 'novo' ),
		)) ?>
	</div>
</div><!-- #comments -->
