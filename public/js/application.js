var timerSaveTextAreas;
var lastTextAreaText = '';

function checkForSessionDeath(html) {
  if( $(html).find('#login').length > 0 ) {
    window.location = '/login';
    return false;
  }
}


function saveTextAreaText() {
  $('textarea').each( function(i) {
    var text = $(this).val()
    if( text != '' && text != lastTextAreaText ) {
      lastTextAreaText = text;
      $.post(
        '/textarea_save',
        {
          text: text,
          id: $(this).attr('id')
        }
      );
      return false;
    }
  } );
}

function fadingAlert(message, x, y) {
  var div = $('<div class="fading-alert has-shadow">'+message+'</div>');
  div.appendTo('html');

  if( ! ( typeof x === 'undefined' || typeof y === 'undefined' ) ) {
    div.css( { left: x+'px', top: y+'px' } );
  }
  setTimeout(
    function() {
      $('.fading-alert').fadeOut(2000);
    },
    1000 + message.length * 50
  );
}

/* ---------------------------------------------------- */

$(document).ready( function() {

  /* TODO: This looks refactorable */
  $('#menu-account').click( function() {
    if( $('#account-window').is(':visible') ) {
      Libertree.UI.hideWindows();
      return false;
    }

    Libertree.UI.hideWindows();
    $('#account-window').toggle();
    return false;
  } );

  $(document).click( function(event) {
    var t = $(event.target);
    if( t.closest('.window').length === 0 && ! t.hasClass('result-selected') ) {
      Libertree.UI.hideWindows();
    }
  } );

  $('input.preview').live( 'click', function() {
    var unrendered = $(this).closest('form').find('textarea[name="text"]').val();

    // abort unless there is text to be rendered
    if (unrendered.length === 0) {
      return false;
    }

    if( $('input[name="hashtags"]').length > 0 ) {
      unrendered = unrendered + "\n\n" + $('input[name="hashtags"]').val();
    }

    var target = $(this).closest('form.comment, form#post-new, form#post-edit, form#new-message');
    var type = $(this).data('type');
    var textType = null;
    if( type === 'post' ) {
      textType = 'post-text';
    }

    $.post(
      '/_render',
      { s: unrendered },
      function(html) {
        checkForSessionDeath(html);
        if( target.length > 0 ) {
          $('.preview-box').remove();
          //TRANSLATEME
          target.append( $('<div class="preview-box" class="'+type+'"><a class="close" href="#">close</a><h3 class="preview">Preview</h3><div class="text typed-text '+textType+'">' + html + '</div></div>') );
          var scrollable = target.closest('div.comments-pane');
          if( scrollable.length === 0 ) {
            scrollable = $('html');
            var delta = $('.preview-box').offset().top - scrollable.scrollTop() - 100;
          } else {
            var delta = $('.preview-box').offset().top - 100;
          }
          scrollable.animate(
            { scrollTop: scrollable.scrollTop() + delta },
            delta * 2
          );
        }
      }
    );
  } );

  $('.preview-box a.close').live( 'click', function() {
    $(this).closest('.preview-box').remove();
    return false;
  } );

  $('.input-and-filler input').live( 'focus', function() {
    $(this).closest('.input-and-filler').find('.filler').hide();
  } );
  $('.input-and-filler input').live( 'blur', function() {
    if( $(this).val() === '' ) {
      $(this).closest('.input-and-filler').find('.filler').show();
    }
  } );
  $('.input-and-filler .filler').live( 'click', function() {
    $(this).closest('.input-and-filler').find('input').focus();
  } );

  $('.textarea-clear').live( 'click', function() {
    var id = $(this).data('textarea-id');
    $('#'+id).val('');
    $.get( '/textarea_clear/' + id );
  } );

  $('.post-excerpt').live( {
    mouseover: function() {
      $(this).find('.post-tools').show();
    },
    mouseout: function() {
      $(this).find('.post-tools').hide();
    }
  } );

  $('.mark-read').live( 'click', function() {
    markPostRead( $(this).closest('div.post, div.post-excerpt').data('post-id') );
    return false;
  } );

  $('.pseudolink').live( 'click', function(e) {
    window.location = $(this).data('href');
  } );

  /* ---------------------------------------------------- */

  setInterval( Libertree.UI.updateAges, 60 * 1000 );
  timerSaveTextAreas = setInterval( saveTextAreaText, 15 * 1000 );

  $('textarea').live( 'mousedown', function() {
    $(this).data('width', $(this).outerWidth());
    $(this).data('height', $(this).outerHeight());
  } );

  $('textarea').live( 'mouseup', function() {
    var th = $(this);
    if( th.outerWidth() != th.data('width') || th.outerHeight() != th.data('height') ) {
      th.addClass('no-autoresize');
    }
    th.data('width', th.outerWidth());
    th.data('height', th.outerHeight());
  } );

  $('textarea').not('.textarea-chat').expandable( { maxRows: 60 } );

  if( layout === 'narrow' ) {
    $('*').mouseover();
  }
} );
