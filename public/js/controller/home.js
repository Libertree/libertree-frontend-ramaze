// register river loader function as continuous scroll handler
$(window).scroll( function() {
  Libertree.UI.continuousScrollHandler(
    function() {
      Libertree.PostLoader.loadFromRiver( $('#post-excerpts').data('river-id') );
    }
  );
} );
