$(document).ready( function() {
  $('#avatar-reset').live( 'click', function(event) {
    event.preventDefault();
    if( confirm('Delete your avatar and reset it to the default?') ) {
      window.location = '/profiles/avatar_reset';
    }
  } );

  $('.profile #river-selector').chosen().change( function() {
    var selector = $('#river-selector');
    var riverId = selector.val();
    var memberId = selector.data('member-id');
    addSpinner( selector.parent(), 'append' );
    $.get(
      '/rivers/add_from/'+riverId+'/'+memberId,
      function() {
        removeSpinner( selector.parent() );
        fadingAlert('Added to river.');
        selector.val('0');
        selector.trigger("liszt:updated");
      }
    );
    return false;
  } );
} );
