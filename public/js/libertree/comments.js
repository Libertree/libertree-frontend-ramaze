$( function() {

  Libertree.Comments = {
    ListSyncer: Vue.extend({
      data: function() {
        return {
          loadingComments: false,
          avoidSlidingToLoadedComments: false,
          // Vue.js doesn't notice DOM changes made by jQuery, so we have to manually inform it
          numShowingDirty: false,
          numTotalOnPost: 0,
          commentCount: {
            i18n: {
              allShown: '',
              someShown: ''
            }
          },
        };
      },

      computed: {
        numShowing: function() {
          // Vue.js dependency which we use to manually dirty this numShowing computed value
          this.numShowingDirty;
          return $(this.$el).find('div.comment').length;
        }
      },

      methods: {
        recompile: function() {
          return this.$compile(this.$el);
        },

        receiveData: function() {
          var el = $(this.$el).find('.data');
          el.remove();

          /* Only one el.data('data-type') for now, but when more than one is
          possible, we'll need a case/switch here. */

          /* el.data('data-type') assumed to be 'num-comments' */

          /* TODO: this num total should probably be updated from the websocket instead of AJAX like this */
          this.numTotalOnPost = el.data('num-total');
          this.commentCount.i18n.allShown = el.data('text-all-showing');
          this.commentCount.i18n.someShown = el.data('text-some-showing');
        },

        jumpToCommentBox: function(event) {
          event.preventDefault();
          event.stopPropagation();
          var commentsDiv = $(event.target).closest('div.comments'),
              commentsPane = $(event.target).closest('div.comments-pane'),
              targetScrollTop = commentsDiv.height() - commentsPane.height();

          commentsPane.animate(
            { scrollTop: targetScrollTop },
            targetScrollTop - commentsPane.scrollTop(),
            'easeOutQuint',
            function() {
              commentsPane.find('textarea').focus().hide().fadeIn();
            }
          );
        },

        loadMore: function(event) {
          var syncer = this;
          if( this.loadingComments ) { return true; }

          event.preventDefault();
          event.stopPropagation();

          this.loadingComments = true;

          var post = $(event.target).closest('.post, .post-excerpt'),
            postId = post.data('post-id'),
            comments = post.find('.comments'),
            toId = comments.find('.comment:first').data('comment-id');

          /* TODO: spinner visibility based on Vue VM data */
          Libertree.UI.addSpinner(comments.find('.comment:first'), 'before', 16);
          $.get(
            '/comments/_comments/'+postId+'/'+toId+'/'+comments.find('span.num-comments').data('n'),
            function(html) {
              if( $.trim(html).length === 0 ) {
                return;
              }
              var o = $( $.trim(html) );

              var scrollable = $('div.comments-pane');
              if( $('.excerpts-view').length ) {
                scrollable = Libertree.UI.scrollable();
              }
              var initialScrollTop = scrollable.scrollTop();
              var initialHeight = comments.height();
              o.insertBefore(comments.find('.comment:first'));
              syncer.receiveData();
              syncer.numShowingDirty = ! syncer.numShowingDirty;
              syncer.recompile();
              Libertree.UI.initSpoilers();
              var delta = comments.height() - initialHeight;

              scrollable.scrollTop( initialScrollTop + delta );
              /* TODO: spinner visibility based on Vue VM data */
              Libertree.UI.removeSpinner('.comments');

              syncer.loadingComments = false;

              if( syncer.avoidSlidingToLoadedComments ) {
                // This is only used once per page load.
                // See "indexOf("#comment-"), below
                syncer.avoidSlidingToLoadedComments = false;
              } else {
                scrollable.animate(
                  { scrollTop: initialScrollTop },
                  delta * 1.5,
                  'easeInOutQuint'
                );
              }
            }
          );

          return false;
        },

        like: Libertree.likeFunction('comment'),
        unlike: Libertree.unlikeFunction('comment'),

        commentDeleted: function(commentId) {
          var comment = $(this.$el).find('.comment[data-comment-id="'+commentId+'"]');
          comment.animate(
            { height: 'toggle', opacity: 'toggle' },
            3000,
            function() {
              comment.remove;
            }
          );
        },
      }
    }),

    insertHtmlFor: function( postId, commentId ) {
      var post = $('.post[data-post-id="'+postId+'"], .post-excerpt[data-post-id="'+postId+'"]');

      if( post.find('.comments:visible').length === 0 ) {
        return;
      }

      var syncer = Libertree.Comments.listSyncers[post.find('.comments-area').attr('id')];
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

    createCommentListSyncer: function(commentsArea) {  /* commentsArea should be a $('.comments-area') */
      var id = commentsArea.attr('id');

      Libertree.Comments.listSyncers[id] = new Libertree.Comments.ListSyncer({el: '#'+id});
      Libertree.Comments.listSyncers[id].receiveData( commentsArea.find('.data[data-data-type="num-comments"]') );

      if( window.location.hash.indexOf("#comment-") === 0 ) {
        Libertree.Comments.listSyncers[id].avoidSlidingToLoadedComments = true;
        Libertree.click('a.load-comments')
      }
    }
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


  Libertree.Comments.listSyncers = {};
  $('.comments-area').each( function() {
    Libertree.Comments.createCommentListSyncer($(this));
  } );
} );
