$(document).ready( function() {
  $('.tags #river-selector').select2({width: '450px'}).change( function (event) {
    event.preventDefault();
    var selector = $('#river-selector'),
        riverId = event.val,
        tag = selector.data('tag'),
        url = '/rivers/_add_term/'+riverId+'/'+'%23'+tag;

    Libertree.UI.listHandler( selector, url );
  } );
} );
