$(document).ready( function() {
  $('.tags #river-selector').chosen().change( function (event) {
    event.preventDefault();
    var selector = $('#river-selector');
    var riverId = selector.val();
    var tag = selector.data('tag');
    Libertree.UI.addSpinner( selector.parent(), 'append' );
    $.get(
      '/rivers/_add_term/'+riverId+'/'+'%23'+tag,
      function() {
        Libertree.UI.removeSpinner( selector.parent() );
        Libertree.UI.fadingAlert( selector.data('msg') );
        selector.val('0');
        selector.trigger("liszt:updated");
      }
    );
  } );
} );
