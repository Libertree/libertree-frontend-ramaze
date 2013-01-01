Libertree.PostLoader = {
  loading: false,

  loader: function( type ) {
    switch( type ) {
      case 'river':
        endpoint = '/posts/_excerpts';
        break;
      case 'profile':
        endpoint = '/profiles/_more';
        break;
      case 'tags':
        endpoint = '/tags/_more';
        break;
      default:
        // not supported
        return function(){};
    }

    return function( value, older_or_newer, time, onSuccess ) {
      Libertree.PostLoader.loading = true;
      $.ajax( {
        type: 'GET',
        url: endpoint + '/' + value + '/' + older_or_newer + '/' + time,
        success: function(html) {
          var o = $(html);
          o.css('display', 'none');

          // Remove old copies of incoming excerpts that may already be in the DOM
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
    };
  },

  // TODO: simplifying this to Libertree.PostLoader.loader('river') throws an error; why?
  loadFromRiver:   function() { this.loader( 'river'   ).apply( this, arguments ) },
  loadFromTags:    function() { this.loader( 'tags'    ).apply( this, arguments ) },
  loadFromProfile: function() { this.loader( 'profile' ).apply( this, arguments ) },
};
