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
    var excerpt = $(this).siblings('.excerpt');
    var overflowed = excerpt.find('.overflowed');
    var excerptParent = $(this).closest('.post-excerpt');
    var postId = excerptParent.data('post-id');

    overflowed.data( 'contracted-height', overflowed.height() );

    excerptParent.find('div.comments.hidden').removeClass('hidden');

    var heightDifference = excerpt.get(0).scrollHeight - overflowed.height();
    var animationSpeed = heightDifference * 2;

    overflowed.animate(
      {
        height: excerpt.get(0).scrollHeight + 'px',
        'max-height': excerpt.get(0).scrollHeight + 'px'
      },
      animationSpeed,
      function() {
        Libertree.Posts.markRead(postId);
        /* cancel explicit height set by animation */
        overflowed.height('auto');
        overflowed.css('max-height', 'none');
        showMoreLink.hide();
        showMoreLink.siblings('.show-less').show();
      }
    );

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
    $(this).hide();
    $(this).siblings('.show-more').show();
    var excerpt = $(this).closest('.post-excerpt');

    var animationSpeed = ( excerpt.find('.overflowed').height() - 200 ) * 2;

    var excerptTop = excerpt.position().top;
    var windowTop = $('html').scrollTop();
    var scrollTop = excerptTop - windowTop;
    if( scrollTop < 100 ){
      $('html').animate(
        { scrollTop: windowTop + ( scrollTop - 100 ) },
        animationSpeed
      );
    }

    var overflowed = excerpt.find('.overflowed');
    overflowed.animate(
      { height: overflowed.data('contracted-height')+'px' },
      animationSpeed,
      function() {
        $(this).closest('.post-excerpt').find('div.comments').addClass('hidden');
      }
    );
    return false;
  } );

  $('.post-excerpt .post-tools a.comment').live( 'click', function(event) {
    event.preventDefault();
    var excerpt = $(this).closest('.post-excerpt');
    Libertree.Home.wantsToComment = true;
    excerpt.find('.show-more').click();
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
