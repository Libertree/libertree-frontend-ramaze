$(document).ready( function() {

  $('#menu-account').click( function() {
    var show_window = ! $('#account-window').is(':visible');
    Libertree.UI.hideWindows();
    if (show_window) {
      $('#account-window').show();
    }
    return false;
  } );

  $(document).on('click', '#toggle-sidebar', function(event) {
    event.preventDefault();
    Libertree.UI.toggleSidebar();
  } );

  // bootstrap popovers for additional information
  $("a[rel=popover]")
    .popover()
    .click(function() {
      return false;
    });

  $(document).on('click', 'a[rel="confirm"]', Libertree.UI.confirmAction);

  $(document).click( function(event) {
    var t = $(event.target);
    if( t.closest('.window').length === 0 && ! t.hasClass('result-selected') ) {
      Libertree.UI.hideWindows();
    }
    // hide all popovers
    $("a[rel=popover]").popover('hide');
  } );


  $(document).on('click', 'input.preview', function() {
    var $this = $(this);
    var unrendered = $this.closest('form').find('textarea[name="text"]').val();

    // abort unless there is text to be rendered
    if (unrendered.length === 0) {
      return false;
    }

    var target = $this.closest('form.comment, form#post-new, form#post-edit, form#new-message'),
      preview_heading = $this.data('preview-heading'),
      close_label = $this.data('preview-close-label'),
      type = $this.data('type'),
      textType = null;

    if( type === 'post' ) {
      textType = 'post-text';
    }

    $.post(
      '/_render',
      { s: unrendered },
      function(html) {
        var scrollable = target.closest('div.comments-pane'),
          delta;

        Libertree.Session.ensureAlive(html);
        if( target.length > 0 ) {
          $('.preview-box').remove();
          target.append( $('<div class="preview-box" class="'+type+'"><a class="close-preview" href="#">'+close_label+'</a><h3 class="preview">'+preview_heading+'</h3><div class="text typed-text '+textType+'">' + html + '</div></div>') );
          if( scrollable.length === 0 ) {
            scrollable = Libertree.UI.scrollable();
            delta = $('.preview-box').offset().top - scrollable.scrollTop() - 100;
          } else {
            delta = $('.preview-box').offset().top - 100;
          }
          scrollable.animate(
            { scrollTop: scrollable.scrollTop() + delta },
            delta * 2
          );
        }
      }
    );
  } );

  $(document).on('click', '.preview-box a.close-preview', function() {
    $(this).closest('.preview-box').remove();
    return false;
  } );

  $(document).on('click', '.textarea-clear', function() {
    var id = $(this).data('textarea-id');
    $('#'+id).val('');
    $.get( '/textarea_clear/' + id );
  } );

  $(document).on('click', '.markdown-injector a', Libertree.UI.markdownInjector);

  $('textarea, input[type="text"]').autocomplete( {
    delay: 500,
    source: function( request, response ) {
      var entireText = request.term;
      var textUpToCursor = entireText.substring(0, this.element.textCursorPosition());
      var indexOfAtSymbol = textUpToCursor.search(/@\S{2,}$/);  /* require at least 2 characters */
      if( indexOfAtSymbol == -1 ) {
        this.element.autocomplete('close');
        return;
      }

      var autocompletableWord = textUpToCursor.substring(indexOfAtSymbol+1);
      var post = $(this.element).closest('[data-post-id]');
      var post_id;
      if( post.length ) {
        post_id = post.data('post-id')
      }

      $.get(
        '/members/autocomplete_handle.json?q='+autocompletableWord+'&commenters_of_post_id='+post_id,
        function(data) {
          var selections = [];
          if( data.commenting_members.length && data.members.length ) {
            selections = data.commenting_members.concat(['---------']).concat(data.members);
          } else if( data.members.length ) {
            selections = data.members;
          } else if( data.commenting_members.length ) {
            selections = data.commenting_members;
          }

          response(selections);
        });
    },
    focus: Libertree.UI.memberHandleAutocompletion,
    change: Libertree.UI.memberHandleAutocompletion,
    select: Libertree.UI.memberHandleAutocompletion
  } );
} );
