$(document).ready( function() {

  $('#scrollable').scroll( function () {
    if( $('#scrollable').scrollTop() + $('#scrollable').height() >= $('.main').height() ) {
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
