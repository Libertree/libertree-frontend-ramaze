Libertree.Comments = {
  replaceNumCommentsFromAJAX: function(ajax_object, post) {
    var numCommentsSpan = ajax_object.filter('span.num-comments.hidden').detach();
    post.find('.comments span.num-comments').replaceWith(numCommentsSpan);
    numCommentsSpan.removeClass('hidden');
  },

  hideLoadCommentsLinkIfAllShown: function(element) {
    var n = parseInt( element.find('.comments .num-comments').data('total') );

    if( element.find('div.comment').length === n ) {
      element.find('a.load-comments').hide();
    }
  },

  insertHtmlFor: function( postId, commentId ) {
    var post = $('.post[data-post-id="'+postId+'"], .post-excerpt[data-post-id="'+postId+'"]');

    if( post.find('.comments:visible').length === 0 ) {
      return;
    }

    $.get(
      '/comments/_comment/'+commentId+'/' + post.find('.comments .num-comments').data('n'),
      function(html) {
        var o = $(html);
        o.insertBefore( post.find('.comments .detachable') );
        Libertree.Comments.replaceNumCommentsFromAJAX(o, post);
        var height = o.height();
        var animationDuration = height*5;
        o.hide().slideDown(animationDuration);
        $('.comments .success[data-comment-id="'+commentId+'"]').fadeOut();

        if( $('textarea.comment.focused').length ) {
          var scrollable = post.find('div.comments-pane');
          if( $('.excerpts-view').length ) {
            scrollable = $('html');
          }
          scrollable.animate(
            { scrollTop: scrollable.scrollTop() + height },
            animationDuration
          );
        }
      }
    );
  }
};

Libertree.Comments.like   = Libertree.mkLike('comment');
Libertree.Comments.unlike = Libertree.mkUnlike('comment');
