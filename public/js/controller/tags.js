// register tag loader function as continuous scroll handler
$(window).scroll( function() {
  Libertree.UI.continuousScrollHandler(
    function() {
      Libertree.PostLoader.loadFromTags(
        $('#post-excerpts').data('tag'),
        'older',
        $('.post-excerpt:last').data('t')
      );
    }
  );
} );
