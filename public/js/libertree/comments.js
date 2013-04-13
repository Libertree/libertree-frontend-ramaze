Libertree.Comments = {
  replaceNumCommentsFromAJAX: function(ajax_object, post) {
    var numCommentsSpan = ajax_object.filter('span.num-comments.hidden').detach();
    post.find('.comments span.num-comments').replaceWith(numCommentsSpan);
    numCommentsSpan.removeClass('hidden');
  },

  hideLoadCommentsLinkIfAllShown: function(element) {
    var n = parseInt( element.find('.comments .num-comments').data('total'), 10 );

    if( element.find('div.comment').length === n ) {
      element.find('a.load-comments').css('visibility', 'hidden');
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
  },

  loadMore: function( linkClicked, dontSlide ) {
    var post = linkClicked.closest('.post, .post-excerpt');
    var postId = post.data('post-id');
    var comments = post.find('.comments');
    var toId = comments.find('.comment:first').data('comment-id');

    Libertree.UI.addSpinner(comments.find('.comment:first'), 'before', 16);
    $.get(
      '/comments/_comments/'+postId+'/'+toId+'/'+comments.find('span.num-comments').data('n'),
      function(html) {
        if( $.trim(html).length === 0 ) {
          return;
        }
        var o = $(html);
        Libertree.Notifications.updateNumUnseen( o.filter('span.num-notifs-unseen').detach().text() );

        var scrollable = $('div.comments-pane');
        if( $('.excerpts-view').length ) {
          scrollable = Libertree.UI.scrollable();
        }
        var initialScrollTop = scrollable.scrollTop();
        var initialHeight = comments.height();
        o.insertBefore(comments.find('.comment:first'));
        var delta = comments.height() - initialHeight;
        Libertree.Comments.replaceNumCommentsFromAJAX(o, post);

        scrollable.scrollTop( initialScrollTop + delta );
        Libertree.Comments.hideLoadCommentsLinkIfAllShown(post);
        Libertree.UI.removeSpinner('.comments');
        linkClicked.removeClass('disabled');

        if( typeof dontSlide == 'undefined' || ! dontSlide ) {
          scrollable.animate(
            { scrollTop: initialScrollTop },
            delta * 1.5,
            'easeInOutQuint'
          );
        }
      }
    );
  }
};

Libertree.Comments.like   = Libertree.mkLike('comment');
Libertree.Comments.unlike = Libertree.mkUnlike('comment');
