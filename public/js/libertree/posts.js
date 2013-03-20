Libertree.Posts = {
  setSubscription: function(type) {
    var endpoint = '/posts/_' + type + '/';
    var update = (type === 'subscribe') ?
      function(post) {
        Libertree.UI.disableIconSpinner(post.find('.subscribe img'));
        post.find('.subscribe').addClass('hidden');
        post.find('.unsubscribe').removeClass('hidden');
      }
    :
      function(post) {
        Libertree.UI.disableIconSpinner(post.find('.unsubscribe img'));
        post.find('.unsubscribe').addClass('hidden');
        post.find('.subscribe').removeClass('hidden');
      }
    ;
    return function(post) {
      Libertree.UI.enableIconSpinner(post.find('.'+type+' img'));
      $.get( endpoint + post.data('post-id'), function() { update(post) } );
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
