$(document).ready( function() {

  $(document).scroll( function () {
    if( $(window).scrollTop() + $(window).innerHeight() >= $(document).height() ) {
      if( loadingMorePostExcerpts || $('#no-more-posts').length ) {
        return;
      }

      $('#post-excerpts div.spinner').appendTo($('#post-excerpts'));
      addSpinner('#post-excerpts div.spinner');
      loadPostExcerpts(
        $('#post-excerpts').data('river-id'),
        'older',
        $('.post-excerpt:last').data('t')
      );
    }
  } );

} );
