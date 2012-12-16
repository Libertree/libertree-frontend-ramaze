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
  }
};
