/*jslint white: true, indent: 2, todo: true */
/*global $, alert, Libertree */

Libertree.Pools = (function () {
  "use strict";

  return {
    createPoolAndAddPost: function(post) {
      var postId = post.data('post-id'),
        textField = post.find('.pools .chzn-search input'),
        poolName = textField.val();

      textField.prop('disabled', true);

      $.get(
        '/pools/create_pool_and_add_post/'+poolName+'/'+postId,
        function(response) {
          var h = $.parseJSON(response);
          if(h.success) {
            $('.pools.window').hide();
            post.find('a.collect').addClass('hidden');
            post.find('a.collected').removeClass('hidden');
          } else {
            alert(h.msg);
          }
          textField.prop('disabled', false);
        }
      );
    },

    addPost: function(poolId, postId, post, x, y) {
      $.get(
        '/pools/add_post/' + poolId + '/' + postId,
        function(response) {
          var h = $.parseJSON(response);
          $('div.pools').remove();
          if(h.success) {
            post.find('a.collect').addClass('hidden');
            post.find('a.collected').removeClass('hidden');
            Libertree.UI.fadingAlert(h.msg, x, y);
          } else {
            alert(h.msg);
          }
        }
      );
    }
  };
}());
