var wantsToComment = false;
var loadingMorePostExcerpts = false;

function showShowMores() {
  $('.overflowed').each( function() {
    var wrapper = $(this).closest('.height-fixed');
    if( $(this).height() > wrapper.height() ) {
      wrapper.siblings('.show-more').show();
    }
  } );
}

/* ---------------------------------------------------- */

$(document).ready( function() {

  $('.excerpt .show-more').live( 'click', function() {
    $(this).hide();
    $(this).siblings('.show-less').show();

    var excerpt = $(this).closest('.excerpt');
    var div = excerpt.find('.height-fixed');
    var overflowed = excerpt.find('.overflowed');
    var excerptParent = $(this).closest('.post-excerpt');

    excerptParent.find('div.comments.hidden').removeClass('hidden');
    showMoreComments( excerpt.find('.comments'), 3 );
    var heightDifference = overflowed.height() - excerpt.height();
    var animationSpeed = heightDifference * 2;

    div.animate(
      { height: overflowed.height() + 'px' },
      animationSpeed,
      function() {
        div.removeClass('height-fixed').addClass('height-normal');
        markPostRead( excerptParent.data('post-id') );
        div.height('auto'); /* cancel explicit height set by animation */
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

    var div = excerpt.find('.height-normal');
    div.animate(
      /* TODO: DRY up with CSS definition of height */
      { height: '200px' },
      animationSpeed,
      function() {
        $(this).closest('.post-excerpt').find('div.comments, div.comment').addClass('hidden');
        div.removeClass('height-normal').addClass('height-fixed');
      }
    );
    return false;
  } );

  $('.post-excerpt .post-tools a.comment').live( 'click', function() {
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

  $('#river-selector').change( function() {
    window.location = '/home/' + $(this).val();
    return false;
  } );

  /* ---------------------------------------------------- */

  showShowMores();
} );
