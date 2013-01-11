Libertree.Home = {
  wantsToComment: false,

  indicateNewPosts: function(data) {
    var indicator = $('#post-excerpts[data-river-id="'+data.riverId+'"] .more-posts');
    if( indicator.length ) {
      indicator.find('.load-more').text(data.numNewPosts);
      indicator.slideDown();
    }
  },

};

/* ---------------------------------------------------- */


$(document).ready( function() {

  $('.post-excerpt .show-more').live( 'click', function() {
    var showMoreLink = $(this);
    var excerpt = showMoreLink.siblings('.excerpt');
    var overflowed = excerpt.find('.overflowed');

    var excerptParent = showMoreLink.closest('.post-excerpt');
    var postId = excerptParent.data('post-id');
    var comments = excerptParent.find('div.comments');
    var commentHeight = comments.get(0).scrollHeight;
    var heightDifference = overflowed.get(0).scrollHeight - overflowed.height();

    Libertree.Posts.markRead(postId);
    showMoreLink.hide();

    //TODO: don't do this. Record the excerpt height somewhere and operate on that.
    overflowed.data( 'contracted-height', overflowed.height() );

    overflowed.animate(
      {
        height: overflowed.get(0).scrollHeight + 'px',
        'max-height': overflowed.get(0).scrollHeight + 'px'
      },
      Libertree.UI.duration(heightDifference), 'linear',
      function() {
        /* cancel explicit height set by animation */
        overflowed.height('auto');
        overflowed.css('max-height', 'none');
        comments.animate(
          { height: commentHeight + 'px' },
          Libertree.UI.duration(commentHeight), 'linear',
          function() {
            comments.height('auto');
            showMoreLink.siblings('.show-less').show();
          });
      });

    if( Libertree.Home.wantsToComment ) {
      var scrollTop = $('html').scrollTop();
      var excerptTruncation = excerpt.position().top + excerpt.height() - scrollTop - $(window).height();
      if( excerptTruncation < 0 ) {
        excerptTruncation = 0;
      }
      $('html').animate(
        { scrollTop: scrollTop + heightDifference + excerptTruncation },
        animationSpeed,
        function() {
          excerpt.find('textarea.comment').focus();
          Libertree.Home.wantsToComment = false;
        }
      );
    }

    return false;
  } );

  $('.post-excerpt .show-less').live( 'click', function() {
    var link = $(this);
    link.hide();
    var excerpt = link.closest('.post-excerpt');
    var overflowed = excerpt.find('.overflowed');
    var comments = excerpt.find('div.comments');
    var distance = overflowed.height() - overflowed.data('contracted-height');

    var excerptTop = excerpt.position().top;
    var windowTop = $('html').scrollTop();
    var scrollTop = excerptTop - windowTop;
    if( scrollTop < 100 ){
      $('html').animate(
        { scrollTop: windowTop + ( scrollTop - 100 ) },
        Libertree.UI.duration(distance)
      );
    }

    comments.animate(
      { height: '0px' },
      Libertree.UI.duration(comments.height()), 'linear',
      function() {
        overflowed.animate(
          { height: overflowed.data('contracted-height')+'px' },
          Libertree.UI.duration(distance), 'linear',
          function() {
            link.siblings('.show-more').show();
          });
      });

    return false;
  } );

  // TODO: there is no comment link anymore. Always assume "wantsToComment"?
  $('.post-excerpt .post-tools a.comment').live( 'click', function(event) {
    event.preventDefault();
    var excerpt = $(this).closest('.post-excerpt');
    Libertree.Home.wantsToComment = true;
    excerpt.find('.show-more').click();
  } );

  $('.overflowed img').live( 'mouseover', function() {
    Libertree.UI.showShowMores();
  } );

  $('.home #river-selector').change( function() {
    window.location = '/home/' + $(this).val();
    return false;
  } );

  $('.overflowed img').live( 'mouseover', function() {
    Libertree.UI.showShowMores();
  } );

  $('.load-more').live( 'click', function(event) {
    event.preventDefault();

    $('#no-more-posts').remove();
    $('.more-posts-divider').removeClass('more-posts-divider');
    $('.post-excerpt:first').addClass('more-posts-divider'),

    Libertree.UI.addSpinner($(this).parent(), 'append');
    Libertree.PostLoader.loadFromRiver(
      $('#post-excerpts').data('river-id'),
      'newer',
      $('.post-excerpt:first').data('t'),
      function() {
        $('.more-posts').hide().detach().prependTo('#post-excerpts');
        $('.more-posts .n').text('0');
      }
    );
  } );

  /* ---------------------------------------------------- */

  Libertree.UI.showShowMores();
} );
