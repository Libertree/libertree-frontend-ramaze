Libertree.mkLike = function(type, entityPath) {
  // TODO: merge the two update functions
  var update = (type === 'comment') ?
    function( entity, response ) {
      var num_likes = entity.find('.num-likes');
      num_likes.text( response['num_likes'] );
      num_likes.attr('title', response['liked_by']);
      num_likes.show();
    }
  :
    function( entity, response ) {
      /* TODO: Clean up this selector */
      var num_likes = entity.find('.post-tools .num-likes, .post-stats .num-likes');
      num_likes.find('.value').text( response['num_likes'] );
      num_likes.attr('title', response['liked_by']);
      num_likes.show();

      // mark post read
      if( entity.find('.mark-unread.hidden').length ) {
        entity.find('.mark-read').addClass('hidden');
        entity.find('.mark-unread').removeClass('hidden');
      }
    }
  ;

  return function(event) {
    event.preventDefault();

    var link = $(this);
    var entity = link.closest(entityPath);

    if( entity.length ) {
      $.get(
        '/likes/'+type+'s/create/' + entity.data(type+'-id'),
        function(response) {
          var h = $.parseJSON(response);
          link.addClass('hidden');
          link.siblings('a.unlike').removeClass('hidden').data(type+'-like-id', h[type+'_like_id']);
          update( entity, h );
        }
      );
    }
  };
}


Libertree.mkUnlike = function(type, entityPath) {
  // TODO: merge these update functions
  var update = (type === 'comment') ?
    function( entity, response ) {
      var num_likes = entity.find('.num-likes');
      num_likes.text( response['num_likes'] );
      // FIXME: gettextify
      if( response['num_likes'] === '0 likes' ) {
        num_likes.hide();
      } else {
        num_likes.attr('title', response['liked_by']);
      }
    }
  :
    function( entity, response ) {
      /* TODO: Clean up this selector */
      var num_likes = entity.find('.post-tools .num-likes, .post-stats .num-likes');
      num_likes.find('.value').text( response['num_likes'] );
      num_likes.attr('title', response['liked_by']);
      if( response['num_likes'] === 0 ) {
        num_likes.hide();
      }
    }
  ;

  return function(event) {
    event.preventDefault();

    var link = $(this);
    var entity = link.closest(entityPath);

    if( entity.length ) {
      $.get(
        '/likes/'+type+'s/destroy/' + link.data(type + '-like-id'),
        function(response) {
          var h = $.parseJSON(response);
          link.addClass('hidden');
          link.siblings('a.like').removeClass('hidden');
          update( entity, h );
        }
      );
    }
  };
};
