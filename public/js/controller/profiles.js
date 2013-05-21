$(document).ready( function() {
  $(document).on('click', '#avatar-reset', function(event) {
    event.preventDefault();
    if( confirm($(this).data('msg')) ) {
      window.location = '/profiles/avatar_reset';
    }
  } );

  $('.profile #contact-list-selector').chosen().change( function (event) {
    event.preventDefault();
    var selector = $('#contact-list-selector'),
      contactListId = selector.val(),
      memberId = selector.data('member-id');

    Libertree.UI.addSpinner( selector.parent(), 'append' );
    $.get(
      '/contact-lists/add_member/'+contactListId+'/'+memberId,
      function() {
        Libertree.UI.removeSpinner( selector.parent() );
        Libertree.UI.fadingAlert( selector.data('msg') );
        selector.val('0');
        selector.trigger("liszt:updated");
      }
    );
  } );
} );
