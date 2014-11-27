/*jslint white: true, indent: 2 */
/*global $, Libertree */

Libertree.Posts = (function () {
  "use strict";

  var setSubscription = function(type) {
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

    hide = function(post_id, onSuccess) {
      $.get(
        '/posts/hidden/create/' + post_id + '.json',
        function(response) {
          var h = $.parseJSON(response);
          if( h.success ) {
            onSuccess();
          }
        }
      );
    },

    markRead = function(post_id) {
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

    subscribe   = setSubscription('subscribe'),
    unsubscribe = setSubscription('unsubscribe'),
    like        = Libertree.likeFunction('post'),
    unlike      = Libertree.unlikeFunction('post');

  return {
    markRead: markRead,

    create: function() {
      var message = $('#post-new .message');

      $('#post-new .message').hide();
      $.post(
        '/posts/create.json',
        $('#post-new').serialize(),
        function(result) {
          if( ! result.success ) {
            message.addClass('error');
            message.text(result.error);
            message.slideDown();
          } else {
            message.removeClass('error');
            message.text(result.message);
            message.slideDown();
            $('#textarea-post-new').val('');
            if( result.matchesRiver ) {
              $.get(
                '/posts/_excerpt/' + result.postId,
                function(html) {
                  var o = $( $.trim(html) ),
                      verticalDelta,
                      animationDuration;

                  o.insertBefore('#post-excerpts .post-excerpt:first');
                  /* Adjust by 60 pixels to account for navigation bar */
                  verticalDelta = o.offset().top - scrollable.scrollTop() - 60;
                  animationDuration = verticalDelta*2;

                  o.hide().slideDown(animationDuration);

                  scrollable.animate(
                    { scrollTop: scrollable.scrollTop() + verticalDelta },
                    animationDuration
                  );
                }
              );
            }
          }
        }
      );

      return false;
    },

    syncers: {},
    Syncer: Vue.extend({
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

        revealSpoiler: function(event) {
          return Libertree.UI.revealSpoiler(event);
        },
      }
    }),

    createPostSyncerFor: function(element) {
      var id = $(element).attr('id');
      Libertree.Posts.syncers[id] = new Libertree.Posts.Syncer({el: '#'+id});
      Libertree.Posts.syncers[id].receiveData();
    },

    init: function() {
      $(document).ready( function() {
        $('.post, .post-excerpt').each( function() {
          Libertree.Posts.createPostSyncerFor(this);

          if( window.location.hash.indexOf("#comment-") === 0 ) {
            Libertree.Posts.syncers[$(this).attr('id')].avoidSlidingToLoadedComments = true;
            Libertree.click('a.load-comments')
          }
        } );

        Libertree.UI.initSpoilers();

        $(document).on('click', '.post-tools a.like', function(event) {
          like(event);
        } );

        $(document).on('click', '.post-tools a.unlike', function(event) {
          unlike(event);
        } );

        $(document).on('click', '.mark-read', function() {
          var post = $(this).closest('div.post, div.post-excerpt');
          Libertree.UI.enableIconSpinner(post.find('.mark-read img'));
          markRead( post.data('post-id') );
          return false;
        } );

        $(document).on('click', '.mark-unread', function() {
          var post = $(this).closest('div.post, div.post-excerpt'),
              icon = post.find('.mark-unread img');

          Libertree.UI.enableIconSpinner(icon);
          $.get(
            '/posts/_unread/' + post.data('post-id'),
            function() {
              Libertree.UI.disableIconSpinner(icon);
              post.find('.mark-unread').addClass('hidden');
              post.find('.mark-read').removeClass('hidden');
            }
          );
          return false;
        } );

        $(document).on('click', '.post-tools a.hide', function() {
          $(this).hide();
          $(this).siblings('.confirm-hide').show();
          return false;
        } );
        $(document).on('click', '.excerpts-view .confirm-hide', function(event) {
          event.preventDefault();
          var post = $(this).closest('div.post-excerpt');
          hide(
            post.data('post-id'),
            function() {
              post.
                slideUp(1000).
                promise().
                done(
                  function() { post.remove(); }
                )
              ;
            }
          );
        } );
        $(document).on('click', '.single-post-view .confirm-hide', function(event) {
          event.preventDefault();
          var post = $(this).closest('div.post');
          hide(
            post.data('post-id'),
            function() {
              window.location = '/home';
            }
          );
        } );

        $(document).on('click', '.post-tools .delete',
          function (event) {
            var $this = $(this),
                post = $this.closest('div.post, div.post-excerpt'),
                postId = post.data('post-id'),
                poolId = $this.data('pool-id'),
                fn = function () {
                  $.get(
                    '/posts/destroy/' + postId + '.json',
                    function () {
                      /* TODO: Check for success */
                      post.slideUp(1000);
                    }
                  );
                };
            Libertree.UI.confirmAjax(event, $this.data('msg'), fn);
          });

        $(document).on('click', '.post-tools .subscribe', function() {
          var post = $(this).closest('div.post, div.post-excerpt');
          subscribe( post );
          return false;
        } );
        $(document).on('click', '.post-tools .unsubscribe', function() {
          var post = $(this).closest('div.post, div.post-excerpt');
          unsubscribe( post );
          return false;
        } );

        $(document).on('click', '#post-new input[type="submit"]', Libertree.UI.TextAreaBackup.disable);
      } );
    }
  };
}());

Libertree.Posts.init();
