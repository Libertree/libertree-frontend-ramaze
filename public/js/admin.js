$(document).ready( function() {
  $('.server.draggable').draggable( {
    revert: true
  } );
  $('.forest').droppable( {
    drop: function( event, ui ) {
      window.location = '/admin/forests/add/' + $(this).data('forest-id') + '/' + ui.draggable.data('server-id');
    }
  } );
  $('.main').droppable( {
    drop: function( event, ui ) {
      if( ui.draggable.data('forest-id') ) {
        window.location = '/admin/forests/ensure_absent/' + ui.draggable.data('forest-id') + '/' + ui.draggable.data('server-id');
      }
    }
  } );
  $(document).on('click', 'table.jobs td a.delete', function(event) {
    event.preventDefault();
    if( confirm($(this).data('msg')) ) {
      window.location = $(this).attr('href');
    }
  } );
} );
