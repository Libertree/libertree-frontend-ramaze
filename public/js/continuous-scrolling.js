$(document).ready( function() {

  $(window).scroll( function () {
    if( $('body').hasClass('profile') ) {
      return;
    }

    if( $(window).scrollTop() + $(window).innerHeight() >= $(document).height() - 300 ) {
      if( loadingMorePostExcerpts || $('#no-more-posts').length ) {
        return;
      }

      $('#post-excerpts div.spinner').appendTo($('#post-excerpts'));
      addSpinner('#post-excerpts div.spinner', 'append');
      loadPostExcerpts(
        $('#post-excerpts').data('river-id'),
        'older',
        $('.post-excerpt:last').data('t')
      );
    }
  } );

} );
