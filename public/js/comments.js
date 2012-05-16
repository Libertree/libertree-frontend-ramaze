function showMoreComments(comments) {
  var n = comments.find('.more-comments').data('n');
  var comment_ids = '';

  for( i = 0; i < n; i++ ) {
    var comment = comments.find('div.comment.hidden:last');
    comment_ids = comment_ids + '/' + comment.data('comment-id');
    comment.removeClass('hidden');
  }
  if( comments.find('div.comment.hidden:last').length == 0 ) {
    comments.find('.more-comments').hide();
  }
  $.get(
    '/notifications/seen_comments' + comment_ids,
    function(html) {
      updateNumNotificationsUnseen(html);
    }
  );

  $('div.comments').css('height', $('td.post').css('height') );
}

function setCommentAreaHeight() {
  var post_proper = $('.post-proper');
  if( post_proper.length ) {
    var target_height = post_proper.height();
    if( target_height < 500 ) {
      target_height = 500;
    }
    $('div.comments').css('height', target_height + 'px' );
  }
}

$(document).ready( function() {
  $('.more-comments').live( 'click', function() {
    showMoreComments( $(this).closest('.comments') );
  } );
  $('.jump-to-comment').live( 'click', function() {
    $(this).siblings('form.comment').find('textarea').focus().hide().fadeIn();
  } );
  $('div.comment').live( {
    mouseover: function() {
      $(this).find('.comment-tools').css('visibility', 'visible');
    },
    mouseout: function() {
      $(this).find('.comment-tools').css('visibility', 'hidden');
    }
  } );
  $('.comment .delete').live( 'click', function() {
    if( confirm('Delete this comment?') ) {
      var comment = $(this).closest('.comment');
      $.get( '/comments/destroy/' + comment.data('comment-id') );
      comment.fadeOut( function() { comment.remove } );
    }
    return false;
  } );

  $('.commenter-ref').live( 'click', function() {
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

  $('div.comment a.like').live( 'click', function() {
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
        }
      );
    }
  } )

  $('div.comment a.unlike').live( 'click', function() {
    var link = $(this);
    var comment = link.closest('div.comment');
    if( comment.length ) {
      $.get(
        '/likes/comments/destroy/' + link.data('comment-like-id'),
        function(response) {
          link.addClass('hidden');
          link.siblings('a.like').removeClass('hidden');
          var num_likes = comment.find('.num-likes');
          num_likes.text( response );
          if( response == '0 likes' ) {
            num_likes.hide();
          }
        }
      );
    }
  } )

  $('form.comment input[type="submit"]').live( 'click', function() {
    clearInterval(timerSaveTextAreas);
  } );

  /* ---------------------------------------------------- */

  setCommentAreaHeight();

  match = document.URL.match(/#comment-([0-9]+)/);
  if( match ) {
    window.location = window.location;  /* Hack for Firefox */
  } else {
    match = document.URL.match(/#comment-new/);
    if( match ) {
      $('.textarea-comment-new').focus();
    }
  }

  var comments_area = $('.comments');
  if( comments_area.length ) {
    comments_area.scrollTop( comments_area.get(0).scrollHeight + 1000 );
  }
} );
