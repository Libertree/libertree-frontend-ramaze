Libertree.Posts = {
  setSubscription: function(type) {
    var endpoint = '/posts/_' + type + '/';
    var update = (type === 'subscribe') ?
      function(post) {
        post.find('.subscribe').addClass('hidden');
        post.find('.unsubscribe').removeClass('hidden');
      }
    :
      function(post) {
        post.find('.unsubscribe').addClass('hidden');
        post.find('.subscribe').removeClass('hidden');
      }
    ;
    return function(post) {
      $.get( endpoint + post.data('post-id'), update(post) );
    };
  },

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

Libertree.Posts.subscribe   = Libertree.Posts.setSubscription('subscribe');
Libertree.Posts.unsubscribe = Libertree.Posts.setSubscription('unsubscribe');
Libertree.Posts.like        = Libertree.mkLike('post');
Libertree.Posts.unlike      = Libertree.mkUnlike('post');
