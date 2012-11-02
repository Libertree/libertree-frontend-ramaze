Libertree.PostLoader = {
  loading: false,

  loadFromRiver: function( riverId, older_or_newer, time, onSuccess ) {
    Libertree.PostLoader.loading = true;
    $.ajax( {
      type: 'GET',
      url: '/posts/_excerpts/' + riverId + '/' + older_or_newer + '/' + time,
      success: function(html) {
        var o = $(html);
        o.css('display', 'none');

        /* Remove old copies of incoming excerpts that may already be in the DOM */
        var container = $('<div/>');
        container.prepend(o);
        container.find('.post-excerpt').each( function() {
          $('.post-excerpt[data-post-id="'+$(this).data('post-id')+'"]').remove();
        } );

        if( older_or_newer === 'newer' ) {
          $('#post-excerpts').prepend(o);
        } else {
          $('#post-excerpts').append(o);
        }
        o.slideDown( function() {
          Libertree.PostLoader.loading = false;
        } );

        Libertree.UI.removeSpinner('#post-excerpts');
        Libertree.UI.showShowMores();
        if(onSuccess) {
          onSuccess();
        }
      }
    } );
  },
};
