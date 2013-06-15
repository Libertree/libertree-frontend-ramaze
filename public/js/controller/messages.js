$(document).ready( function() {
  $('#toggle-new-message, a.reply, a.reply-to-all').click( function() {
    $('form#new-message').slideDown();
    return false;
  } );

  $('a.reply').click( function() {
    $('form#new-message #recipients option').prop('selected', false);
    $('form#new-message #recipients option[value="'+$('.sender').data('member-id')+'"]').prop('selected', true);
    $('select#recipients').trigger("liszt:updated");
    return false;
  } );

  $('a.reply-to-all').click( function() {
    $('form#new-message #recipients option').prop('selected', false);
    $('form#new-message #recipients option[value="'+$('.sender').data('member-id')+'"]').prop('selected', true);
    $('.recipients .recipient').each( function() {
      $('form#new-message #recipients option[value="'+$(this).data('member-id')+'"]').prop('selected', true);
    } );
    $('form#new-message #recipients option[value="'+$('form#new-message').data('member-id')+'"]').prop('selected', false);
    $('select#recipients').trigger("liszt:updated");
    return false;
  } );

  $('input#recipients').select2({
      width: '450px',
      multiple: true,
      minimumInputLength: 3,
      //TRANSLATEME
      //formatSearching: function () { return "Searching ..." },
      formatInputTooShort: false, // do not show "type n more characters to search"
      initSelection: function (element, callback) {
          // this is needed to auto-fill the input when replying
          var data = JSON.parse($('input#participants').val());
          // only pick first unless all are specified
          if (element.val() !== 'all') {
              data = [ data[0] ];
          }
          callback(data);
      },
      ajax: {
          url: "/messages/search.json",
          dataType: 'json',
          data: function (term, page) {
              return { q: term };
          },
          results: function (data, page) {
              return {results: data};
          }
      },
  });
} );
