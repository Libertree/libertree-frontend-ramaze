/*jslint white: true, indent: 2, todo: true */
/*global $, Libertree, alert, confirm */

$(document).ready( function() {
  "use strict";

  $(document).on('click', '.jump-to-comment', function(event) {
    event.preventDefault();
    var comments = $(this).closest('div.comments');
    comments.animate(
      { scrollTop: comments.scrollTop() + comments.height() + 200 },
      ( $('.detachable').position().top - 500 ) * 2,
      'easeOutQuint',
      function() {
        comments.find('textarea').focus().hide().fadeIn();
      }
    );
  } );

  $(document).on('click', 'a.load-comments:not(.disabled)', function(event) {
    event.preventDefault();
    $(this).addClass('disabled');
    Libertree.Comments.loadMore($(this));
    return false;
  } );

  $(document).on('mouseover', 'div.comment', function() {
    $(this).find('.comment-tools').css('visibility', 'visible');
  } );
  $(document).on('mouseout', 'div.comment', function() {
    $(this).find('.comment-tools').css('visibility', 'hidden');
  } );

  $(document).on('click', '.comment .delete', function(event) {
    event.preventDefault();
    var comment = $(this).closest('.comment');
    if( confirm(comment.find('.delete').data('msg')) ) {
      $.get( '/comments/destroy/' + comment.data('comment-id') );
      comment.fadeOut( function() { comment.remove } );
    }
    return false;
  } );

  $(document).on('click', '.commenter-ref', function(event) {
    event.preventDefault();
    var source = $(this),
      member_id = source.data('member-id'),
      source_comment = source.closest('div.comment'),
      candidates = $('div.comment[data-commenter-member-id="'+member_id+'"]').toArray().reverse(),
      target_comment = null;

    $.each( candidates, function() {
      if( Number($(this).data('comment-id')) < Number(source_comment.data('comment-id')) ) {
        target_comment = $(this);
        return false;
      }
    } );
    if( target_comment ) {
      target_comment.find('.go-ref-back').data('id-back', source_comment.attr('id')).show();
      target_comment.css('opacity', '0').animate({opacity: 1.0}, 2000);
      window.location = '#' + target_comment.attr('id');
    }
  } );
  $(document).on('click', '.go-ref-back', function() {
    $(this).hide();
    window.location = '#' + $(this).data('id-back');
  } );

  $(document).on('click', 'div.comment a.like', function(event) {
    Libertree.Comments.like( $(this), event, 'div.comment' );
  } );

  $(document).on('click', 'div.comment a.unlike', function(event) {
    Libertree.Comments.unlike( $(this), event, 'div.comment' );
  } );

  $(document).on('click', 'form.comment input.submit', function() {
    var submitButton = $(this),
      form = submitButton.closest('form.comment'),
      textarea = form.find('textarea.comment'),
      postId = form.data('post-id');

    submitButton.prop('disabled', true);
    Libertree.UI.addSpinner( submitButton.closest('.form-buttons'), 'append', 16 );
    Libertree.UI.TextAreaBackup.disable();

    $.post(
      '/comments/create',
      {
        post_id: postId,
        text: textarea.val()
      },
      function(response) {
        var h = $.parseJSON(response),
          post;

        if( h.success ) {
          textarea.val('').height(50);
          $('.preview-box').remove();
          post = $('.post[data-post-id="'+postId+'"], .post-excerpt[data-post-id="'+postId+'"]');
          post.find('.subscribe').addClass('hidden');
          post.find('.unsubscribe').removeClass('hidden');

          if( $('#comment-'+h.commentId).length === 0 ) {
            form.closest('.comments').find('.success')
              .attr('data-comment-id', h.commentId) /* setting with .data() can't be read with later .data() call */
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
  } );

  $(document).on('click', '.detachable .detach', function(event) {
    event.preventDefault();
    var detachable = $(this).closest('.detachable'),
      offset = detachable.offset();

    detachable.addClass('detached');
    detachable.addClass('has-shadow');
    detachable.css('top', offset.top + 'px');
    detachable.css('left', offset.left + 'px');
    detachable.find('.detach').hide();
    detachable.find('.attach').show();
    detachable.draggable();
    return false;
  } );

  $(document).on('click', '.detachable .attach', function(event) {
    event.preventDefault();
    var detachable = $(this).closest('.detachable');
    detachable.removeClass('detached');
    detachable.removeClass('has-shadow');
    detachable.find('.attach').hide();
    detachable.find('.detach').show();
    detachable.draggable('destroy');
    return false;
  } );

  $(document).on('focus', 'textarea.comment', function() {
    $(this).addClass('focused');
  } );
  $(document).on('blur', 'textarea.comment', function() {
    $(this).removeClass('focused');
  } );

  /* ---------------------------------------------------- */

  if( window.location.hash.length > 0 ) {
    window.location = window.location;  /* Hack for Firefox */
    Libertree.Comments.loadMore( $('a.load-comments'), true );
  }

  Libertree.Comments.hideLoadCommentsLinkIfAllShown( $('.post') );
} );
