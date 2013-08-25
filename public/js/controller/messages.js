$(document).ready( function() {
  $('#toggle-new-message, a.reply, a.reply-to-all').click( function() {
    $('form#new-message').slideDown();
    return false;
  } );

  $('a.reply').click( function (event) {
    event.preventDefault();
    $('input#recipients').val('sender').trigger('change');
  } );

  $('a.reply-to-all').click( function (event) {
    event.preventDefault();
    $('input#recipients').val('all').trigger('change');
  } );

  $('input#recipients').select2(
      jQuery.extend(
          Libertree.UI.selectDefaults,
          {
            initSelection: function (element, callback) {
              // this is needed to auto-fill the input when replying
              var data = JSON.parse($('input#participants').val());
              // only pick first unless all are specified
              if (element.val() !== 'all') {
                  data = [ data[0] ];
              }
              callback(data);
            }
          }));
} );
