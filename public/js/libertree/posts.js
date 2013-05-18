/*jslint white: true, indent: 2 */
/*global $, Libertree, confirm */

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
  };

  return {
    subscribe:   setSubscription('subscribe'),
    unsubscribe: setSubscription('unsubscribe'),
    like:        Libertree.mkLike('post'),
    unlike:      Libertree.mkUnlike('post'),
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
    },

    init: function() {
      $(document).ready( function() {

        $(document).on('click', '.post-tools a.like', function(event) {
          Libertree.Posts.like( $(this), event, 'div.post, .post-excerpt' );
        } );

        $(document).on('click', '.post-tools a.unlike', function(event) {
          Libertree.Posts.unlike( $(this), event, 'div.post, .post-excerpt' );
        } );

        $(document).on('click', '.mark-read', function() {
          var post = $(this).closest('div.post, div.post-excerpt');
          Libertree.UI.enableIconSpinner(post.find('.mark-read img'));
          Libertree.Posts.markRead( post.data('post-id') );
          return false;
        } );

        $(document).on('click', '.mark-unread', function() {
          var post = $(this).closest('div.post, div.post-excerpt');
          var icon = post.find('.mark-unread img');
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

        $('#comments-hide').click( function() {
          $('div.post').addClass('with-comments-sliding');
          $('div.comments, #comments-hide').hide();
          $('#comments-show').show();
          $('div.post-pane, div.comments-pane').toggleClass(
            'expanded-post',
            500
          );
        } );
        $('#comments-show').click( function() {
          $('#comments-show').hide();
          $('#comments-hide').show();
          $('div.comments-pane, div.post-pane').toggleClass('expanded-post', 500).promise().done(
            function () {
              $('div.comments').show();
              $('div.post').removeClass('with-comments-sliding');
            }
          );
        } );

        $(document).on('click', '.post-tools a.hide', function() {
          $(this).hide();
          $(this).siblings('.confirm-hide').show();
          return false;
        } );
        $(document).on('click', '.excerpts-view .confirm-hide', function(event) {
          event.preventDefault();
          var post = $(this).closest('div.post-excerpt');
          Libertree.Posts.hide(
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
          Libertree.Posts.hide(
            post.data('post-id'),
            function() {
              window.location = '/home';
            }
          );
        } );

        $(document).on('click', '.post-tools .delete', function(event) {
          event.preventDefault();
          if( confirm($(this).data('msg')) ) {
            var post = $(this).closest('div[data-post-id]');
            window.location = '/posts/destroy/' + post.data('post-id');
          }
        } );

        $(document).on('click', '.post-tools .subscribe', function() {
          var post = $(this).closest('div.post, div.post-excerpt');
          Libertree.Posts.subscribe( post );
          return false;
        } );
        $(document).on('click', '.post-tools .unsubscribe', function() {
          var post = $(this).closest('div.post, div.post-excerpt');
          Libertree.Posts.unsubscribe( post );
          return false;
        } );
      } );
    }
  };
}());

Libertree.Posts.init();
