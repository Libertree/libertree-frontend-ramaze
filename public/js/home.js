var wantsToComment = false;
var loadingMorePostExcerpts = false;

function showShowMores() {
  $('.excerpt').each( function() {
    if( $(this).get(0).scrollHeight > $(this).height() ) {
      $(this).children('.show-more').show();
    }
  } );
}

/* ---------------------------------------------------- */

$(document).ready( function() {

  $('.excerpt .show-more').live( 'click', function() {
    var showMoreLink = $(this);
    var excerpt = $(this).closest('.excerpt');
    var overflowed = excerpt.find('.overflowed');
    var excerptParent = $(this).closest('.post-excerpt');
    var postId = excerptParent.data('post-id');
    $.get('/accounts/watch_post/'+postId);

    excerptParent.find('div.comments.hidden').removeClass('hidden');
    showMoreComments( excerpt.find('.comments'), 3 );

    excerpt.data( 'contracted-height', excerpt.height() );
    overflowed.data( 'contracted-height', overflowed.height() );
    overflowed.css('height', 'auto');

    var heightDifference = excerpt.get(0).scrollHeight - excerpt.height();
    var animationSpeed = heightDifference * 2;

    excerpt.animate(
      {
        height: excerpt.get(0).scrollHeight + 'px',
        'max-height': excerpt.get(0).scrollHeight + 'px'
      },
      animationSpeed,
      function() {
        markPostRead(postId);
        /* cancel explicit height set by animation */
        excerpt.height('auto');
        excerpt.css('max-height', 'none');
        showMoreLink.hide();
        showMoreLink.siblings('.show-less').show();
      }
    );

    if( wantsToComment ) {
      var bgTop = $('#scrollable').scrollTop();
      var excerptTruncation = excerpt.offset().top + excerpt.height() - $('#scrollable').height();
      if( excerptTruncation < 0 ) {
        excerptTruncation = 0;
      }
      $('#scrollable').animate(
        { scrollTop: bgTop + heightDifference + excerptTruncation },
        animationSpeed,
        function() {
          excerpt.find('textarea.comment').focus();
          wantsToComment = false;
        }
      );
    }

    return false;
  } );

  $('.excerpt .show-less').live( 'click', function() {
    $(this).hide();
    $(this).siblings('.show-more').show();
    var excerpt = $(this).closest('.excerpt');

    var animationSpeed = ( excerpt.find('.overflowed').height() - 200 ) * 2;

    var top = excerpt.position().top;
    var bgTop = $('#scrollable').scrollTop();
    if( top < 100 ){
      $('#scrollable').animate(
        { scrollTop: bgTop + ( top - 100 ) },
        animationSpeed
      );
    }

    var overflowed = excerpt.find('.overflowed');
    excerpt.animate(
      { height: excerpt.data('contracted-height')+'px' },
      animationSpeed,
      function() {
        $(this).closest('.post-excerpt').find('div.comments, div.comment').addClass('hidden');
        overflowed.css('height', overflowed.data('contracted-height')+'px');
      }
    );
    return false;
  } );

  $('.post-excerpt .post-tools a.comment').live( 'click', function(event) {
    event.preventDefault();
    var excerpt = $(this).closest('.post-excerpt');
    wantsToComment = true;
    excerpt.find('.show-more').click();
  } );

  $('#scrollable').scroll( function () {
    if( $('#scrollable').scrollTop() + $('#scrollable').height() >= $('.main').height() ) {
      if( loadingMorePostExcerpts || $('#no-more-posts').length ) {
        return;
      }

      addSpinner('#post-excerpts');
      loadingMorePostExcerpts = true;
      $.ajax( {
        type: 'GET',
        url: '/posts/_excerpts/' + $('#post-excerpts').data('river-id') + '/' + $('.post-excerpt:last').data('t'),
        success: function(html) {
          $('#post-excerpts').append(html);
          loadingMorePostExcerpts = false;
          removeSpinner('#post-excerpts');
          showShowMores();
        }
      } );
    }
  } );

  $('.home #river-selector').change( function() {
    window.location = '/home/' + $(this).val();
    return false;
  } );

  $('.height-fixed img').live( 'mouseover', function() {
    showShowMores();
  } );

  /* ---------------------------------------------------- */

  showShowMores();
} );
