Libertree.Posts = {
  setSubscription: function(type) {
    var endpoint = '/posts/_' + type + '/',
        classes = ['.subscribe', '.unsubscribe'],
        toggle = (type === 'subscribe') ? classes : classes.reverse();

    return function (post) {
      var icon = post.find(toggle[0] + ' img');
      Libertree.UI.enableIconSpinner(icon);
      $.get( endpoint + post.data('post-id'),
             function () {
               Libertree.UI.disableIconSpinner(icon);
               post.find(toggle[0]).addClass('hidden');
               post.find(toggle[1]).removeClass('hidden');
             });
    };
  },

  markRead: function(post_id) {
    $.get(
      '/posts/_read/' + post_id,
      function() {
        var post = $('*[data-post-id="'+post_id+'"]');
        Libertree.UI.disableIconSpinner(post.find('.mark-read img'));
        post.find('.mark-read').addClass('hidden');
        post.find('.mark-unread').removeClass('hidden');
      }
    );
  },

  hide: function(post_id, onSuccess) {
    $.get(
      '/posts/hidden/create/' + post_id + '.json',
      function(response) {
        var h = $.parseJSON(response);
        if( h.success ) {
          onSuccess();
        }
      }
    );
  }

};

Libertree.Posts.subscribe   = Libertree.Posts.setSubscription('subscribe');
Libertree.Posts.unsubscribe = Libertree.Posts.setSubscription('unsubscribe');
Libertree.Posts.like        = Libertree.mkLike('post');
Libertree.Posts.unlike      = Libertree.mkUnlike('post');
