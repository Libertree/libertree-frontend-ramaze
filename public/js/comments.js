function showMoreComments(comments, n) {
  var comment_ids = '';

  for( i = 0; i < n; i++ ) {
    var comment = comments.find('div.comment.hidden:last');
    comment_ids = comment_ids + '/' + comment.data('comment-id');
    comment.removeClass('hidden');
  }
  if( comments.find('div.comment.hidden:last').length == 0 ) {
    comments.find('span.more-comments').hide();
  }
  $.get(
    '/notifications/seen_comments' + comment_ids,
    function(html) {
      updateNumNotificationsUnseen(html);
    }
  );

  $('div.comments').css('height', $('td.post').css('height') );
}

function insertCommentHtmlFor( postId, commentId ) {
  var post = $('.post[data-post-id="'+postId+'"], .post-excerpt[data-post-id="'+postId+'"]');

  if( post.find('.comments:visible').length == 0 ) {
    return;
  }

  $.get(
    '/comments/_comment/' + commentId,
    function(html) {
      var o = $(html);
      o.insertBefore( post.find('.comments .detachable') );
      var height = o.height();
      var animationDuration = height*5;
      o.hide().slideDown(animationDuration);
      $('.comments .success[data-comment-id="'+commentId+'"]').fadeOut();
      var newNum = 1 + parseInt(post.find('span.num-comments:first').text());
      post.find('span.num-comments').text(newNum);

      if( $('textarea.comment.focused').length ) {
        var scrollable = post.find('div.comments-pane');
        if( $('.excerpts-view').length ) {
          scrollable = $('html');
        }
        scrollable.animate(
          { scrollTop: scrollable.scrollTop() + height },
          animationDuration
        );
      }
    }
  );
}

/* ---------------------------------------------- */

$(document).ready( function() {
  $('a.more-comments').live( 'click', function(event) {
    event.preventDefault();
    showMoreComments( $(this).closest('.comments'), $(this).data('n') );
  } );
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
    event.preventDefault();
    var link = $(this);
    var comment = link.closest('div.comment');
    if( comment.length ) {
      $.get(
        '/likes/comments/create/' + comment.data('comment-id'),
        function(response) {
          var h = $.parseJSON(response);
          link.addClass('hidden');
          link.siblings('a.unlike').removeClass('hidden').data('comment-like-id', h['comment_like_id']);
          comment.find('.num-likes').text( h['num_likes'] ).show();
          comment.find('.num-likes').attr('title', h['liked_by']);
        }
      );
    }
  } )

  $('div.comment a.unlike').live( 'click', function(event) {
    event.preventDefault();
    var link = $(this);
    var comment = link.closest('div.comment');
    if( comment.length ) {
      $.get(
        '/likes/comments/destroy/' + link.data('comment-like-id'),
        function(response) {
          var h = $.parseJSON(response);
          link.addClass('hidden');
          link.siblings('a.like').removeClass('hidden');
          var num_likes = comment.find('.num-likes');
          num_likes.text( h['num_likes'] );
          if( h['num_likes'] == '0 likes' ) {
            num_likes.hide();
          }
          else {
            comment.find('.num-likes').attr('title', h['liked_by']);
          }
        }
      );
    }
  } )

  $('form.comment input.submit').live( 'click', function() {
    var submitButton = $(this);
    submitButton.attr('disabled', 'disabled');
    addSpinner( submitButton.closest('.form-buttons'), 16 );
    var form = $(this).closest('form.comment');
    var textarea = form.find('textarea.comment');
    clearInterval(timerSaveTextAreas);
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

          if( $('#comment-'+h.commentId).length == 0 ) {
            form.closest('.comments').find('.success')
              .attr('data-comment-id', h.commentId) /* setting with .data() can't be read with later .data() call */
              .fadeIn()
            ;
          }
        } else {
          alert('Failed to post comment.');
        }
        submitButton.removeAttr('disabled');
        removeSpinner( submitButton.closest('.form-buttons') );
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

  match = document.URL.match(/#comment-([0-9]+)/);
  if( match ) {
    window.location = window.location;  /* Hack for Firefox */
  }
} );
