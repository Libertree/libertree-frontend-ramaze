Libertree.PostLoader = (function() {
  var mkLoader = function( type ) {
    var endpoint,
        loading = false;
        self = this;

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
      case 'pool':
        endpoint = '/pools/_more';
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
          var DOMNodes = $( $.trim(html) ),
              excerpts = Libertree.UI.animatableNodesOnly(DOMNodes);

          excerpts.css('display', 'none');

          if( older_or_newer === 'newer' ) {
            $('#post-excerpts').prepend(excerpts);
          } else {
            $('#post-excerpts').append(excerpts);
          }
          Libertree.UI.makeTextAreasExpandable();
          excerpts.slideDown( function() {
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
  };

  return {
    loadFromRiver:   mkLoader( 'river'   ),
    loadFromTags:    mkLoader( 'tags'    ),
    loadFromProfile: mkLoader( 'profile' ),
    loadFromPool:    mkLoader( 'pool'    ),
  };
}());
