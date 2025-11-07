<form role="search" method="get" class="searchform" action="<?php echo esc_url(home_url('/')) ?>" >
	<button type="submit" class="searchsubmit" value=""><i class="basic-ui-icon-search"></i></button>
	<div><input type="text" value="<?php echo esc_attr(get_search_query()) ?>" placeholder="<?php echo esc_html__('Type and hit enter', 'novo') ?>" name="s" class="input" /></div>
</form>