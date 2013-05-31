$(document).ready( function() {
  $(document).on('click', '#avatar-reset', Libertree.UI.confirmAction );

  $('.profile #contact-list-selector').chosen().change( function (event) {
    event.preventDefault();
    var selector = $('#contact-list-selector'),
      contactListId = selector.val(),
      memberId = selector.data('member-id'),
      url = '/contact-lists/add_member/'+contactListId+'/'+memberId;

    Libertree.UI.listHandler( selector, url );
  } );
} );
