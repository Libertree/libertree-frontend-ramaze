Libertree.Comments = {
  insertHtmlFor: function( postId, commentId ) {
    var post = $('.post[data-post-id="'+postId+'"], .post-excerpt[data-post-id="'+postId+'"]');

    if( post.find('.comments:visible').length === 0 ) {
      return;
    }

    var syncer = Libertree.Posts.syncers[post.attr('id')];
    $.get(
      '/comments/_comment/'+commentId+'/' + syncer.numTotalOnPost,
      function(html) {
        var o = $( $.trim(html) );
        o.insertBefore( post.find('.comments .detachable') );
        var height = o.height();
        var animationDuration = height*5;
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
        syncer.receiveData();
        syncer.numShowingDirty = ! syncer.numShowingDirty;
        syncer.recompile();
        Libertree.UI.initSpoilers();
      }
    );
  },

  submit: function (event) {
    event.preventDefault();
    var submitButton = $(this),
        form = submitButton.closest('form.comment'),
        textarea = form.find('textarea.comment'),
        postId = form.data('post-id');

    submitButton.prop('disabled', true);
    Libertree.UI.addSpinner( submitButton.closest('.form-buttons'), 'append', 16 );
    Libertree.UI.TextAreaBackup.disable();

    $.post(
      '/comments/create.json',
      {
        post_id: postId,
        text: textarea.val()
      },
      function(response) {
        var post;

        if( response.success ) {
          textarea.val('').height(50);
          $('.preview-box').remove();
          post = $('.post[data-post-id="'+postId+'"], .post-excerpt[data-post-id="'+postId+'"]');
          post.find('.subscribe').addClass('hidden');
          post.find('.unsubscribe').removeClass('hidden');

          if( $('#comment-'+response.commentId).length === 0 ) {
            form.closest('.comments').find('.success')
              .attr('data-comment-id', response.commentId) /* setting with .data() can't be read with later .data() call */
              .fadeIn()
            ;
          }
        } else {
          alert(submitButton.data('msg-failure'));
        }
        submitButton.prop('disabled', false);
        Libertree.UI.removeSpinner( submitButton.closest('.form-buttons') );
      }
    );
  },
};

/* TODO: A comment Vue should know its own id (as a property) */
Vue.component('comp-comment', {
  paramAttributes: ['data-comment-id', 'data-likes-count', 'data-likes-desc', 'data-deletion-confirmation-prompt'],
  data: function() {
    return {
      toolsVisible: false
    };
  },
  methods: {
    showTools: function() { this.toolsVisible = true; },
    hideTools: function() { this.toolsVisible = false; },
    delete: function(event) {
      event.preventDefault();
      var commentId = this.commentId,
        fn = function () {
          $.get( '/comments/destroy/' + commentId );
          /* TODO: Visually, the comment remains on-screen.  In a future
          commit, we will have the comment list update via websocket. */
        };

      Libertree.UI.confirmAjax(event, this.deletionConfirmationPrompt, fn);
    },
    revealSpoiler: function(event) {
      return Libertree.UI.revealSpoiler(event);
    }
  }
} );

Vue.component('comp-num-comments', {
  template: '#template-num-comments',
  computed: {
    text: function() {
      /* We may consider using https://github.com/alexei/sprintf.js */
      /* TODO: Or better yet, we should probably use Vue.js mustaches here! */
      var formatString;
      if( this.$parent.numShowing == this.$parent.numTotalOnPost ) {
        formatString = this.$parent.commentCount.i18n.allShown;
      } else {
        formatString = this.$parent.commentCount.i18n.someShown;
      }
      return formatString.replace('%d', this.$parent.numShowing);
    }
  }
} );
