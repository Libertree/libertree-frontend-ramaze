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
  $('.post-tools a.like').live( 'click', function() {
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
          num_likes.show();
        }
      );
    }
  } )

  $('.post-tools a.unlike').live( 'click', function() {
    var link = $(this);
    var post = link.closest('div.post, .post-excerpt');
    if( post.length ) {
      $.get(
        '/likes/posts/destroy/' + link.data('post-like-id'),
        function(response) {
          link.addClass('hidden');
          link.siblings('a.like').removeClass('hidden');
          /* TODO: Clean up this selector */
          var num_likes = post.find('.post-tools .num-likes, .post-stats .num-likes');
          num_likes.find('.value').text( response );
          if( response.match('0') ) {
            num_likes.hide();
          }
        }
      );
    }
  } )

  $('#comments-hide').click( function() {
    $('div.comments, #comments-hide').hide();
    $('#comments-show').show();
    $('td.post').addClass('expanded').animate(
      {width: '980px'},
      500,
      'easeOutQuint'
    );
    $('td.comments').animate(
      {width: '20px'},
      500,
      'easeOutQuint'
    );
  } );
  $('#comments-show').click( function() {
    $('#comments-show').hide();
    $('td.comments, td.post').removeClass('expanded').animate(
      {width: '500px'},
      500,
      'easeOutQuint',
      function () {
        $('div.comments, #comments-hide').show();
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

  $('.post-tools .delete').live( 'click', function() {
    if( confirm('Delete this post?') ) {
      var post = $(this).closest('div[data-post-id]');
      window.location = '/posts/destroy/' + post.data('post-id');
    }
    return false;
  } );
} );
