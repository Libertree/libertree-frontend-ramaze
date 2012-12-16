Libertree.Posts = {
  markRead: function(post_id) {
    $.get(
      '/posts/_read/' + post_id,
      function() {
        var post = $('*[data-post-id="'+post_id+'"]');
        post.find('.mark-read').addClass('hidden');
        post.find('.mark-unread').removeClass('hidden');
      }
    );
  },

  hashtagCheckTimer: undefined,
  checkForHashtags: function() {
    if (Libertree.Posts.hashtagCheckTimer != undefined) {
      clearTimeout(Libertree.Posts.hashtagCheckTimer);
    }
    Libertree.Posts.hashtagCheckTimer = setTimeout(
      Libertree.Posts.checkForHashtagsCallback,
      500
    );
  },

  checkForHashtagsCallback: function() {
    if( $('#post-new textarea').val().match(/#[a-zA-Z0-9_-]/) ) {
      $('#hashtags-input').hide();
    } else {
      $('#hashtags-input').show();
    }
  }
};
