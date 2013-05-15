// register post loader function as continuous scroll handler
$(window).scroll( function() {
  Libertree.UI.continuousScrollHandler(
    function() {
      Libertree.PostLoader.loadFromPool( $('#post-excerpts').data('pool-id') );
    }
  );
} );
