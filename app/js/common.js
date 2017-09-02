$(document).ready(function() {
  $('.top-nav__trigger').click(function() {
  	$(this).toggleClass('active');
    $('.top-nav__list').slideToggle(500);
  });
  
  $(window).resize(function() {		
		if (  $(window).width() > 768 ) {			
			$('.top-nav__list').removeAttr('style');
		 }
	});
});