$(document).ready( function() {
  $('.server').draggable( {
    revert: true
  } );
  $('.forest').droppable( {
    drop: function( event, ui ) {
      window.location = '/admin/forests/add/' + $(this).data('forest-id') + '/' + ui.draggable.data('server-id');
    }
  } );
} );
