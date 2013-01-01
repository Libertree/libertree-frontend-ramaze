$(document).ready( function() {
  $('.jump-to-comment').live( 'click', function(event) {
    event.preventDefault();
    var comments = $(this).closest('div.comments');
    comments.animate(
      { scrollTop: comments.scrollTop() + comments.height() + 200 },
      ( $('.detachable').position().top - 500 ) * 2,
      'easeOutQuint',
      function() {
        comments.find('textarea').focus().hide().fadeIn();
      }
    );
  } );

  $('a.load-comments').live( 'click', function(event) {
    event.preventDefault();

    var post = $(this).closest('.post, .post-excerpt');
    var postId = post.data('post-id');
    var comments = post.find('.comments');
    var toId = comments.find('.comment:first').data('comment-id');

    Libertree.UI.addSpinner(comments.find('.comment:first'), 'before', 16);
    $.get(
      '/comments/_comments/'+postId+'/'+toId+'/'+comments.find('span.num-comments').data('n'),
      function(html) {
        if( $.trim(html).length === 0 ) {
          return;
        }
        var o = $(html);
        Libertree.Notifications.updateNumUnseen( o.filter('span.num-notifs-unseen').detach().text() );

        var scrollable = $('div.comments-pane');
        if( $('.excerpts-view').length ) {
          scrollable = $('html');
        }
        var initialScrollTop = scrollable.scrollTop();
        var initialHeight = comments.height();
        o.insertBefore(comments.find('.comment:first'));
        var delta = comments.height() - initialHeight;
        Libertree.Comments.replaceNumCommentsFromAJAX(o, post);

        scrollable.scrollTop( initialScrollTop + delta );
        Libertree.Comments.hideLoadCommentsLinkIfAllShown(post);
        Libertree.UI.removeSpinner('.comments');
      }
    );

    return false;
  } );

  $('div.comment').live( {
    mouseover: function() {
      $(this).find('.comment-tools').css('visibility', 'visible');
    },
    mouseout: function() {
      $(this).find('.comment-tools').css('visibility', 'hidden');
    }
  } );

  $('.comment .delete').live( 'click', function(event) {
    event.preventDefault();
    // TODO: gettextify
    if( confirm('Delete this comment?') ) {
      var comment = $(this).closest('.comment');
      $.get( '/comments/destroy/' + comment.data('comment-id') );
      comment.fadeOut( function() { comment.remove } );
    }
    return false;
  } );

  $('.commenter-ref').live( 'click', function(event) {
    event.preventDefault();
    var source = $(this);
    var member_id = source.data('member-id');
    var source_comment = source.closest('div.comment');
    var candidates = $('div.comment[data-commenter-member-id="'+member_id+'"]').toArray().reverse();
    var target_comment = null;
    $.each( candidates, function() {
      if( 0 + $(this).data('comment-id') < 0 + source_comment.data('comment-id') ) {
        target_comment = $(this);
        return false;
      }
    } );
    if( target_comment ) {
      target_comment.find('.go-ref-back').data('id-back', source_comment.attr('id')).show();
      target_comment.css('opacity', '0').animate({opacity: 1.0}, 2000);
      window.location = '#' + target_comment.attr('id');
    }
  } );
  $('.go-ref-back').live( 'click', function() {
    $(this).hide();
    window.location = '#' + $(this).data('id-back');
  } );

  $('div.comment a.like').live( 'click', function(event) {
    Libertree.Comments.like( $(this), event, 'div.comment' );
  } );

  $('div.comment a.unlike').live( 'click', function(event) {
    Libertree.Comments.unlike( $(this), event, 'div.comment' );
  } );

  $('form.comment input.submit').live( 'click', function() {
    var submitButton = $(this);
    submitButton.attr('disabled', 'disabled');
    Libertree.UI.addSpinner( submitButton.closest('.form-buttons'), 'append', 16 );
    var form = $(this).closest('form.comment');
    var textarea = form.find('textarea.comment');
    Libertree.UI.TextAreaBackup.disable();
    var postId = form.data('post-id');

    $.post(
      '/comments/create',
      {
        post_id: postId,
        text: textarea.val()
      },
      function(response) {
        var h = $.parseJSON(response);
        if( h.success ) {
          textarea.val('').height(50);
          $('.preview-box').remove();
          var post = $('.post[data-post-id="'+postId+'"], .post-excerpt[data-post-id="'+postId+'"]');
          post.find('.subscribe').addClass('hidden');
          post.find('.unsubscribe').removeClass('hidden');

          if( $('#comment-'+h.commentId).length === 0 ) {
            form.closest('.comments').find('.success')
              .attr('data-comment-id', h.commentId) /* setting with .data() can't be read with later .data() call */
              .fadeIn()
            ;
          }
        } else {
          //TRANSLATEME
          alert('Failed to post comment.');
        }
        submitButton.removeAttr('disabled');
        Libertree.UI.removeSpinner( submitButton.closest('.form-buttons') );
      }
    );
  } );

  $('.detachable .detach').live( 'click', function(event) {
    event.preventDefault();
    var detachable = $(this).closest('.detachable');
    var offset = detachable.offset();
    detachable.addClass('detached');
    detachable.addClass('has-shadow');
    detachable.css('top', offset.top + 'px');
    detachable.css('left', offset.left + 'px');
    detachable.find('.detach').hide();
    detachable.find('.attach').show();
    detachable.draggable();
    return false;
  } );

  $('.detachable .attach').live( 'click', function(event) {
    event.preventDefault();
    var detachable = $(this).closest('.detachable');
    detachable.removeClass('detached');
    detachable.removeClass('has-shadow');
    detachable.find('.attach').hide();
    detachable.find('.detach').show();
    detachable.draggable('destroy');
    return false;
  } );

  $('textarea.comment').live( 'focus', function() {
    $(this).addClass('focused');
  } );
  $('textarea.comment').live( 'blur', function() {
    $(this).removeClass('focused');
  } );

  /* ---------------------------------------------------- */

  // TODO: replace with window.location.hash
  match = document.URL.match(/#comment-([0-9]+)/);
  if( match ) {
    window.location = window.location;  /* Hack for Firefox */
    $('a.load-comments').click();
  }

  Libertree.Comments.hideLoadCommentsLinkIfAllShown( $('.post') );
} );
