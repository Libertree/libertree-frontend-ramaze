$(document).ready( function() {
  $('#avatar-reset').live( 'click', function(event) {
    event.preventDefault();
    if( confirm($(this).data('msg')) ) {
      window.location = '/profiles/avatar_reset';
    }
  } );

  $('.profile #contact-list-selector').chosen().change( function() {
    var selector = $('#contact-list-selector');
    var contactListId = selector.val();
    var memberId = selector.data('member-id');
    addSpinner( selector.parent(), 'append' );
    $.get(
      '/contact-lists/add_member/'+contactListId+'/'+memberId,
      function() {
        removeSpinner( selector.parent() );
        fadingAlert('Added to contact list.');
        selector.val('0');
        selector.trigger("liszt:updated");
      }
    );
    return false;
  } );
} );
