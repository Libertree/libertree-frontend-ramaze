function markPostRead(post_id) {
  $.get(
    '/posts/read/' + post_id,
    function() {
      var post = $('*[data-post-id="'+post_id+'"]');
      post.find('.mark-read').addClass('hidden');
      post.find('.mark-unread').removeClass('hidden');
    }
  );
}

$(document).ready( function() {
  $('.post-tools a.like').live( 'click', function(event) {
    event.preventDefault();
    var link = $(this);
    var post = link.closest('div.post, .post-excerpt');
    if( post.length ) {
      $.get(
        '/likes/posts/create/' + post.data('post-id'),
        function(response) {
          var h = $.parseJSON(response);
          link.addClass('hidden');
          link.siblings('a.unlike').removeClass('hidden').data('post-like-id', h['post_like_id']);
          /* TODO: Clean up this selector */
          var num_likes = post.find('.post-tools .num-likes, .post-stats .num-likes');
          num_likes.find('.value').text( h['num_likes'] );
          num_likes.attr('title', h['liked_by']);
          num_likes.show();
          if( post.find('.mark-unread.hidden').length ) {
            post.find('.mark-read').addClass('hidden');
            post.find('.mark-unread').removeClass('hidden');
          }
        }
      );
    }
  } )

  $('.post-tools a.unlike').live( 'click', function(event) {
    event.preventDefault();
    var link = $(this);
    var post = link.closest('div.post, .post-excerpt');
    if( post.length ) {
      $.get(
        '/likes/posts/destroy/' + link.data('post-like-id'),
        function(response) {
          var h = $.parseJSON(response);
          link.addClass('hidden');
          link.siblings('a.like').removeClass('hidden');
          /* TODO: Clean up this selector */
          var num_likes = post.find('.post-tools .num-likes, .post-stats .num-likes');
          num_likes.find('.value').text( h['num_likes'] );
          num_likes.attr('title', h['liked_by']);
          if( h['num_likes'] == 0 ) {
            num_likes.hide();
          }
        }
      );
    }
  } )

  $('#comments-hide').click( function() {
    $('div.post').addClass('with-comments-sliding');
    $('div.comments, #comments-hide').hide();
    $('#comments-show').show();
    $('div.post-pane, div.comments-pane').toggleClass(
      'expanded-post',
      500
    );
  } );
  $('#comments-show').click( function() {
    $('#comments-show').hide();
    $('#comments-hide').show();
    $('div.comments-pane, div.post-pane').toggleClass('expanded-post', 500).promise().done(
      function () {
        $('div.comments').show();
        $('div.post').removeClass('with-comments-sliding');
      }
    );
  } );

  $('.post-excerpt .hide').live( 'click', function() {
    $(this).hide();
    $(this).siblings('.confirm-hide').show();
    return false;
  } );
  $('.post-excerpt .confirm-hide').live( 'click', function(event) {
    event.preventDefault();
    var post = $(this).closest('div.post-excerpt');
    $.get(
      '/posts/hidden/create/' + post.data('post-id') + '.json',
      function(response) {
        var h = $.parseJSON(response);
        if( h.success ) {
          post.slideUp(1000).promise().done(function() { post.remove(); });
        }
      }
    );
  } );

  $('.mark-unread').live( 'click', function() {
    var post = $(this).closest('div.post, div.post-excerpt');
    $.get(
      '/posts/unread/' + post.data('post-id'),
      function() {
        post.find('.mark-unread').addClass('hidden');
        post.find('.mark-read').removeClass('hidden');
      }
    );
    return false;
  } );

  $('.post-tools .delete').live( 'click', function(event) {
    event.preventDefault();
    if( confirm($(this).data('msg')) ) {
      var post = $(this).closest('div[data-post-id]');
      window.location = '/posts/destroy/' + post.data('post-id');
    }
  } );

  $('.post-tools .subscribe').live( 'click', function() {
    var post = $(this).closest('div.post, div.post-excerpt');
    $.get(
      '/posts/subscribe/' + post.data('post-id'),
      function() {
        post.find('.subscribe').addClass('hidden');
        post.find('.unsubscribe').removeClass('hidden');
      }
    );
    return false;
  } );
  $('.post-tools .unsubscribe').live( 'click', function() {
    var post = $(this).closest('div.post, div.post-excerpt');
    $.get(
      '/posts/unsubscribe/' + post.data('post-id'),
      function() {
        post.find('.unsubscribe').addClass('hidden');
        post.find('.subscribe').removeClass('hidden');
      }
    );
    return false;
  } );

  $('.post-tools .visibility').live( 'click', function(event) {
    event.preventDefault();
    fadingAlert(
      $(this).data('description'),
      event.clientX - 200,
      event.clientY + 10
    );
    return false;
  } );
} );
