Libertree.Pools = {
  createPoolAndAddPost: function(post) {
    var postId = post.data('post-id');
    var textField = post.find('.pools .chzn-search input');
    textField.attr('disabled', 'disabled');
    var poolName = textField.val();
    $.get(
      '/pools/create_pool_and_add_post/'+poolName+'/'+postId,
      function(response) {
        var h = $.parseJSON(response);
        if(h.success) {
          $('.pools.window').hide();
        } else {
          alert(h.msg);
        }
        textField.removeAttr('disabled');
      }
    );
  },

  addPost: function(poolId, postId, collect_link, x, y) {
    $.get(
      '/pools/add_post/' + poolId + '/' + postId,
      function(response) {
        var h = $.parseJSON(response);
        $('div.pools').remove();
        if(h.success) {
          collect_link.text(collect_link.data('text-success'));
          fadingAlert(h.msg, x, y);
        } else {
          alert(h.msg);
        }
      }
    );
  }

};
