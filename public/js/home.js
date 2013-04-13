Libertree.Home = {
  wantsToComment: false,

  indicateNewPosts: function(data) {
    var indicator = $('#post-excerpts[data-river-id="'+data.riverId+'"] .more-posts');
    if( indicator.length ) {
      indicator.find('.load-more').text(data.numNewPosts);
      indicator.slideDown();
    }
  }
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

    Libertree.Posts.markRead(postId);
    showMoreLink.hide();

    //TODO: don't do this. Record the excerpt height somewhere and operate on that.
    overflowed.data( 'contracted-height', overflowed.height() );

    excerptParent.find('div.comments.hidden').removeClass('hidden');

    var heightDifference = excerpt.get(0).scrollHeight - overflowed.height();
    var animationDuration = Libertree.UI.duration(heightDifference);

    overflowed.animate(
      {
        height: excerpt.get(0).scrollHeight + 'px',
        'max-height': excerpt.get(0).scrollHeight + 'px'
      },
      animationDuration,
      function() {
        /* cancel explicit height set by animation */
        overflowed.height('auto');
        overflowed.css('max-height', 'none');
        showMoreLink.siblings('.show-less').show();
      }
    );

    if( Libertree.Home.wantsToComment ) {
      var scrollable = Libertree.UI.scrollable();
      var scrollTop = scrollable.scrollTop();
      var excerptTruncation = excerpt.position().top + excerpt.height() - scrollTop - $(window).height();
      if( excerptTruncation < 0 ) {
        excerptTruncation = 0;
      }
      scrollable.animate(
        { scrollTop: scrollTop + heightDifference + excerptTruncation },
        animationDuration,
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
    var distance = excerpt.height() - overflowed.data('contracted-height');
    var animationDuration = Libertree.UI.duration(distance);

    var excerptTop = excerpt.position().top;
    var scrollable = Libertree.UI.scrollable();
    var windowTop = scrollable.scrollTop();
    var scrollTop = excerptTop - windowTop;
    if( scrollTop < 100 ){
      scrollable.animate(
        { scrollTop: windowTop + ( scrollTop - 100 ) },
        animationDuration
      );
    }

    overflowed.animate(
      { height: overflowed.data('contracted-height')+'px' },
      animationDuration,
      function() {
        $(this).closest('.post-excerpt').find('div.comments').addClass('hidden');
        link.siblings('.show-more').show();
      }
    );

    return false;
  } );

  var scrollable = Libertree.UI.scrollable();
  scrollable.mousewheel( function(event, delta, deltaX, deltaY) {
    scrollable.stop();
  } );

  $('.post-excerpt .post-tools a.comment').live( 'click', function(event) {
    event.preventDefault();
    var excerpt = $(this).closest('.post-excerpt');
    Libertree.Home.wantsToComment = true;
    excerpt.find('.show-more').click();
  } );

  $('.overflowed img').live( 'mouseover', function() {
    var excerpt = $(this).closest('.post-excerpt');
    // NOTE: we cannot use Libertree.UI.showShowMores() because that would inspect *all* excerpts
    if( excerpt.find('.post-text').height() > excerpt.find('.overflowed').height() ) {
      excerpt.siblings('.show-more').show();
    }
  } );

  $('.load-more').live( 'click', function(event) {
    event.preventDefault();

    $('#no-more-posts').remove();
    $('.more-posts-divider').removeClass('more-posts-divider');
    $('.post-excerpt:first').addClass('more-posts-divider');

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
