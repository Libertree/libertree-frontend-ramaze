$(document).ready( function() {
  $('.tags #river-selector').chosen().change( function (event) {
    event.preventDefault();
    var selector = $('#river-selector'),
      riverId = selector.val(),
      tag = selector.data('tag'),
      url = '/rivers/_add_term/'+riverId+'/'+'%23'+tag;

    Libertree.UI.listHandler( selector, url );
  } );
} );
