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

$(document).ready( function() {
  $('.tags #river-selector').chosen().change( function() {
    var selector = $('#river-selector');
    var riverId = selector.val();
    var tag = selector.data('tag');
    Libertree.UI.addSpinner( selector.parent(), 'append' );
    $.get(
      '/rivers/_add_term/'+riverId+'/'+'%23'+tag,
      function() {
        Libertree.UI.removeSpinner( selector.parent() );
        // TRANSLATEME
        Libertree.UI.fadingAlert('Added to river.');
        selector.val('0');
        selector.trigger("liszt:updated");
      }
    );
    return false;
  } );
} );
