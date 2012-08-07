$(document).ready( function() {

  $('#scrollable').scroll( function () {
    if( $('#scrollable').scrollTop() + $('#scrollable').height() >= $('.main').height() ) {
      if( loadingMorePostExcerpts || $('#no-more-posts').length ) {
        return;
      }

      addSpinner('#post-excerpts');
      loadingMorePostExcerpts = true;
      $.ajax( {
        type: 'GET',
        url: '/posts/_excerpts/' + $('#post-excerpts').data('river-id') + '/' + $('.post-excerpt:last').data('t'),
        success: function(html) {
          $('#post-excerpts').append(html);
          loadingMorePostExcerpts = false;
          removeSpinner('#post-excerpts');
          showShowMores();
        }
      } );
    }
  } );

} );
