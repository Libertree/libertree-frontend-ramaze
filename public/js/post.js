$(document).ready( function() {

  $('.post-tools a.like').live( 'click', function(event) {
    Libertree.Posts.like( $(this), event, 'div.post, .post-excerpt' );
  } );

  $('.post-tools a.unlike').live( 'click', function(event) {
    Libertree.Posts.unlike( $(this), event, 'div.post, .post-excerpt' );
  } );

  $('.mark-read').live( 'click', function() {
    var post = $(this).closest('div.post, div.post-excerpt');
    Libertree.UI.enableIconSpinner(post.find('.mark-read img'));
    Libertree.Posts.markRead( post.data('post-id') );
    return false;
  } );

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

  $('.post-tools a.hide').live( 'click', function() {
    $(this).hide();
    $(this).siblings('.confirm-hide').show();
    return false;
  } );
  $('.excerpts-view .confirm-hide').live( 'click', function(event) {
    event.preventDefault();
    var post = $(this).closest('div.post-excerpt');
    Libertree.Posts.hide(
      post.data('post-id'),
      function() {
        post.
          slideUp(1000).
          promise().
          done(
            function() { post.remove(); }
          )
        ;
      }
    );
  } );
  $('.single-post-view .confirm-hide').live( 'click', function(event) {
    event.preventDefault();
    var post = $(this).closest('div.post');
    Libertree.Posts.hide(
      post.data('post-id'),
      function() {
        window.location = '/home';
      }
    );
  } );

  $('.mark-unread').live( 'click', function() {
    var post = $(this).closest('div.post, div.post-excerpt');
    var icon = post.find('.mark-unread img');
    Libertree.UI.enableIconSpinner(icon);
    $.get(
      '/posts/_unread/' + post.data('post-id'),
      function() {
        Libertree.UI.disableIconSpinner(icon);
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
    Libertree.Posts.subscribe( post );
    return false;
  } );
  $('.post-tools .unsubscribe').live( 'click', function() {
    var post = $(this).closest('div.post, div.post-excerpt');
    Libertree.Posts.unsubscribe( post );
    return false;
  } );
} );
