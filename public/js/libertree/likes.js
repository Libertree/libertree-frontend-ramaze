Libertree.likeFunction = function(type) {
  var entityPath, update;

  // TODO: merge the two update functions
  if( type === 'comment' ) {
    entityPath = 'div.comment';
    update = function( entity, response ) {
      var num_likes = entity.find('.num-likes');
      num_likes.text( response['num_likes'] );
      num_likes.attr('title', response['liked_by']);
      num_likes.show();
    };
  } else { // type === 'post'
    entityPath = 'div.post, .post-excerpt';
    update = function( entity, response ) {
      var num_likes = entity.find('.num-likes').first();
      num_likes.find('.value').text( response['num_likes'] );
      num_likes.attr('title', response['liked_by']);
      num_likes.show();

      // mark post read
      if( entity.find('.mark-unread.hidden').length ) {
        entity.find('.mark-read').addClass('hidden');
        entity.find('.mark-unread').removeClass('hidden');
      }
    };
  }

  return function(event) {
    event.preventDefault();
    event.stopPropagation();
    var link = $(event.target).closest('a.like');
    var entity = link.closest(entityPath);
    Libertree.UI.enableIconSpinner(link.find('img'));
    $.get(
      '/likes/'+type+'s/create/' + entity.data(type+'-id'),
      function(response) {
        var h = $.parseJSON(response);
        Libertree.UI.disableIconSpinner(link.find('img'));
        link.addClass('hidden');
        link.siblings('a.unlike').removeClass('hidden').data(type+'-like-id', h[type+'_like_id']);
        update( entity, h );
      }
    );
  };
};


Libertree.unlikeFunction = function(type) {
  var entityPath, update;

  // TODO: merge these update functions
  if( type === 'comment' ) {
    entityPath = 'div.comment';
    update = function( entity, response ) {
      var num_likes = entity.find('.num-likes');
      num_likes.text( response['text'] );
      if( response['num_likes'] === 0 ) {
        num_likes.hide();
      } else {
        num_likes.attr('title', response['liked_by']);
      }
    };
  } else {
    entityPath = 'div.post, .post-excerpt';
    update = function( entity, response ) {
      var num_likes = entity.find('.num-likes').first();
      num_likes.find('.value').text( response['num_likes'] );
      num_likes.attr('title', response['liked_by']);
    };
  }

  return function(event) {
    event.preventDefault();
    var link = $(event.target).closest('a.unlike');
    var entity = link.closest(entityPath);
    Libertree.UI.enableIconSpinner(link.find('img'));
    $.get(
      '/likes/'+type+'s/destroy/' + link.data(type + '-like-id'),
      function(response) {
        var h = $.parseJSON(response);
        Libertree.UI.disableIconSpinner(link.find('img'));
        link.addClass('hidden');
        link.siblings('a.like').removeClass('hidden');
        update( entity, h );
      }
    );
  };
};
