// register tag loader function as continuous scroll handler
$(window).scroll( function() {
  Libertree.UI.continuousScrollHandler(
    function() {
      Libertree.PostLoader.loadFromProfile(
        $('#post-excerpts').data('member-id'),
        'older',
        $('.post-excerpt:last').data('t')
      );
    }
  );
} );

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
    Libertree.UI.addSpinner( selector.parent(), 'append' );
    $.get(
      '/contact-lists/add_member/'+contactListId+'/'+memberId,
      function() {
        Libertree.UI.removeSpinner( selector.parent() );
        // TRANSLATEME
        Libertree.UI.fadingAlert('Added to contact list.');
        selector.val('0');
        selector.trigger("liszt:updated");
      }
    );
    return false;
  } );
} );
